package br.com.conectatea.dashboard.api;

import br.com.conectatea.conexao.domain.StatusConexao;
import br.com.conectatea.conexao.infrastructure.ConexaoRepository;
import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.meta.infrastructure.MetaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.sessao.domain.StatusSessao;
import br.com.conectatea.sessao.infrastructure.SessaoRepository;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneOffset;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Map;
import java.util.function.Function;
import br.com.conectatea.shared.time.LocalTimeZoneResolver;
import br.com.conectatea.crianca.domain.StatusAcompanhamento;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Dashboards")
public class DashboardController {
    private final ProfissionalRepository professionals;
    private final CriancaRepository children;
    private final MetaRepository metas;
    private final SessaoRepository sessions;
    private final ConexaoRepository connections;

    private final br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository professionalLinks;
    private final Clock clock;
    private final LocalTimeZoneResolver timeZones;
    private final br.com.conectatea.progresso.infrastructure.ProgressoRepository progress;
    private final br.com.conectatea.notificacao.infrastructure.NotificacaoRepository notifications;

    public DashboardController(
            ProfissionalRepository professionals,
            CriancaRepository children,
            MetaRepository metas,
            SessaoRepository sessions,
            ConexaoRepository connections,
            br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository professionalLinks,
            Clock clock, LocalTimeZoneResolver timeZones,
            br.com.conectatea.progresso.infrastructure.ProgressoRepository progress,
            br.com.conectatea.notificacao.infrastructure.NotificacaoRepository notifications) {
        this.professionals = professionals;
        this.children = children;
        this.metas = metas;
        this.sessions = sessions;
        this.connections = connections;
        this.professionalLinks = professionalLinks;
        this.clock=clock; this.timeZones=timeZones;
        this.progress=progress;this.notifications=notifications;
    }

    @GetMapping("/profissional")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ProfessionalDashboard professional(Authentication authentication) {
        var professional = currentProfessional(authentication);
        var linkedChildren = children.findLinkedToProfessional(professional).stream().filter(c->c.getStatusAcompanhamento()==StatusAcompanhamento.EM_ACOMPANHAMENTO).toList();
        var childIds = linkedChildren.stream().map(Crianca::getId).toList();
        var professionalGoals = childIds.isEmpty() ? List.<Meta>of() : metas.findByCriancaIdIn(childIds);
        
        long teamSize = childIds.isEmpty() ? 0 : professionalLinks.countDistinctProfissionaisByCriancaIdInAndStatus(childIds, br.com.conectatea.vinculo.domain.StatusVinculo.VINCULADO);

        var zone=timeZones.resolve(null);
        var now=clock.instant();
        var localNow=LocalDate.ofInstant(now,zone);
        var monthStart = localNow.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        var nextMonth=localNow.withDayOfMonth(1).plusMonths(1).atStartOfDay(zone).toInstant();
        long teamJoinedThisMonth=childIds.isEmpty()?0:professionalLinks.countDistinctProfissionaisVinculadosNoPeriodo(childIds,br.com.conectatea.vinculo.domain.StatusVinculo.VINCULADO,monthStart,nextMonth);
                
        int activeGoals = (int) professionalGoals.stream().filter(g -> g.getStatus() == StatusMeta.EM_ANDAMENTO).count();

        return new ProfessionalDashboard(
                linkedChildren.size(),
                linkedChildren.stream().filter(item -> item.getCreatedAt() != null
                        && !item.getCreatedAt().isBefore(monthStart)).count(),
                teamSize,
                teamJoinedThisMonth,
                professionalGoals.size(),
                activeGoals,
                professionalGoals.stream().filter(item -> item.getCreatedAt() != null
                        && !item.getCreatedAt().isBefore(monthStart)).count(),
                currentProgress(professionalGoals),
                currentProgress(professionalGoals.stream()
                        .filter(item -> item.getCreatedAt() != null
                                && !item.getCreatedAt().isBefore(monthStart))
                        .toList()),
                countWeekSessions(childIds,zone),
                notifications.countByDestinatarioUsuarioIdAndLidaFalse(((AuthenticatedUser)authentication.getPrincipal()).id()));
    }

    @GetMapping("/profissional/criancas")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public List<ChildDashboard> professionalChildren(Authentication authentication) {
        return children.findLinkedToProfessional(currentProfessional(authentication)).stream().filter(c->c.getStatusAcompanhamento()==StatusAcompanhamento.EM_ACOMPANHAMENTO)
                .map(ChildDashboard::from)
                .toList();
    }

    @GetMapping("/profissional/metas")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public List<GoalDashboard> professionalGoals(Authentication authentication) {
        var linkedChildren = children.findLinkedToProfessional(currentProfessional(authentication)).stream().filter(c->c.getStatusAcompanhamento()==StatusAcompanhamento.EM_ACOMPANHAMENTO).toList();
        var childIds = linkedChildren.stream().map(Crianca::getId).toList();
        var goals = childIds.isEmpty() ? List.<Meta>of() : metas.findByCriancaIdIn(childIds);
        var names = children.findAllById(goals.stream().map(Meta::getCriancaId).distinct().toList())
                .stream().collect(Collectors.toMap(Crianca::getId, Crianca::getNome));
        return goals.stream()
                .map(item -> GoalDashboard.from(item, names.get(item.getCriancaId())))
                .toList();
    }

    @GetMapping("/responsavel")
    @PreAuthorize("hasRole('RESPONSAVEL')")
    public GuardianDashboard guardian(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        var linkedChildren = children.findLinkedToGuardian(user.id()).stream().filter(c->c.getStatusAcompanhamento()==StatusAcompanhamento.EM_ACOMPANHAMENTO).toList();
        var ids = linkedChildren.stream().map(Crianca::getId).toList();
        var goals = ids.isEmpty() ? List.<Meta>of() : metas.findByCriancaIdIn(ids);
        var activeGoals=goals.stream().filter(g->g.getStatus()==StatusMeta.EM_ANDAMENTO).toList();
        var zone=timeZones.resolve(null);var now=OffsetDateTime.ofInstant(clock.instant(),zone);
        var upcomingSessions=ids.isEmpty()?0:sessions.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqual(ids,StatusSessao.AGENDADA,now);
        var summary=currentProgress(goals);
        return new GuardianDashboard(
                linkedChildren.size(), activeGoals.size(), countWeekSessions(ids,zone), upcomingSessions,
                notifications.countByDestinatarioUsuarioIdAndLidaFalse(user.id()),summary);
    }

    private Long currentProfessional(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        return professionals.findByUsuarioId(user.id()).orElseThrow().getId();
    }

    private ProgressSummary currentProgress(List<Meta> goals) {
        var active=goals.stream().filter(g->g.getStatus()==StatusMeta.EM_ANDAMENTO).toList();
        var records=active.isEmpty()?List.<br.com.conectatea.progresso.domain.Progresso>of():progress.findByMetaIdInOrderByDataAsc(active.stream().map(Meta::getId).toList());
        Map<Long,br.com.conectatea.progresso.domain.Progresso> latest=records.stream().collect(Collectors.toMap(br.com.conectatea.progresso.domain.Progresso::getMetaId,Function.identity(),(a,b)->b));
        var known=active.stream().filter(g->latest.containsKey(g.getId())).toList();
        Double average=known.isEmpty()?null:known.stream().mapToInt(g->latest.get(g.getId()).getProgressoAtual()).average().orElseThrow();
        return new ProgressSummary(average,known.size(),active.size()-known.size(),goals.stream().filter(g->g.getStatus()==StatusMeta.PAUSADA).count(),goals.stream().filter(g->g.getStatus()==StatusMeta.CONCLUIDA).count());
    }

    private long countWeekSessions(List<Long> childIds,java.time.ZoneId zone){if(childIds.isEmpty())return 0;var today=LocalDate.ofInstant(clock.instant(),zone);var monday=today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));return sessions.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(childIds,StatusSessao.AGENDADA,monday.atStartOfDay(zone).toOffsetDateTime(),monday.plusWeeks(1).atStartOfDay(zone).toOffsetDateTime());}

    public record ProfessionalDashboard(
            int totalCriancas,
            long criancasEsteMes,
            long profissionaisAtivos,
            long profissionaisAtivosEsteMes,
            int totalMetas,
            int metasAtivas,
            long totalMetasEsteMes,
            ProgressSummary progressoAtual,
            ProgressSummary progressoAtualEsteMes,
            long sessoesSemana,
            long notificacoesNaoLidas) {
    }

    public record GuardianDashboard(
            int totalCriancas,
            int metasAtivas,
            long sessoesSemana,
            long sessoesProximas,
            long notificacoesNaoLidas,
            ProgressSummary progressoAtual) {
    }

    public record ProgressSummary(Double media,int metasComDados,int metasSemDados,long metasPausadas,long metasConcluidas){}

    public record ChildDashboard(
            Long id,
            String nome,
            int idade,
            String diagnostico) {
        static ChildDashboard from(Crianca child) {
            return new ChildDashboard(
                    child.getId(), child.getNome(),
                    Period.between(child.getDataNascimento(), LocalDate.now()).getYears(),
                    child.getDiagnostico());
        }
    }

    public record GoalDashboard(
            Long id,
            String titulo,
            StatusMeta status,
            int progresso,
            String crianca) {
        static GoalDashboard from(Meta goal, String childName) {
            return new GoalDashboard(
                    goal.getId(), goal.getTitulo(), goal.getStatus(),
                    goal.getProgresso(), childName);
        }
    }
}
