package br.com.conectatea.dashboard.api;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.domain.StatusAcompanhamento;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.meta.infrastructure.MetaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.progresso.application.LatestProgressService;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.sessao.domain.StatusSessao;
import br.com.conectatea.sessao.infrastructure.SessaoRepository;
import br.com.conectatea.shared.time.LocalTimeZoneResolver;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de dashboard para profissionais e responsáveis.
 *
 * <h3>Política de fuso horário</h3>
 * Os limites civis (semana, mês, "próximas sessões") dependem do fuso local do usuário.
 * O projeto ainda não possui fonte confiável do fuso individual no backend (pendência de produto):
 * a criança tem apenas UF, que é ambígua no Brasil (ex.: Mato Grosso do Sul usa UTC-4,
 * não UTC-3). Por isso, os endpoints aceitam o parâmetro {@code timezone} (identificador IANA).
 *
 * <ul>
 *   <li>Se fornecido e válido: usado diretamente.</li>
 *   <li>Se ausente: usa {@code APP_TIME_ZONE}; o fallback da configuração é {@code America/Bahia}.</li>
 *   <li>Valor informado ou configurado inválido é rejeitado; não há inferência por UF.</li>
 *   <li>Para o dashboard agregado com múltiplas crianças, o calendário usa o fuso informado
 *       pelo cliente; sem um fuso único por criança, somar contagens calculadas em janelas
 *       diferentes não teria semântica clara.</li>
 * </ul>
 *
 * <p><b>Limitação documentada</b>: enquanto o projeto não persistir o fuso IANA preferido
 * do usuário, os limites locais dependem do parâmetro enviado pelo frontend ou da configuração global.
 * Não se deve declarar resolução por localidade como concluída até que a fonte esteja disponível.
 */
@RestController
@RequestMapping("/dashboard")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Dashboards")
public class DashboardController {

    private final ProfissionalRepository professionals;
    private final CriancaRepository children;
    private final MetaRepository metas;
    private final SessaoRepository sessions;
    private final VinculoProfissionalRepository professionalLinks;
    private final Clock clock;
    private final LocalTimeZoneResolver timeZones;
    private final LatestProgressService latestProgress;
    private final br.com.conectatea.notificacao.infrastructure.NotificacaoRepository notifications;

    public DashboardController(
            ProfissionalRepository professionals,
            CriancaRepository children,
            MetaRepository metas,
            SessaoRepository sessions,
            VinculoProfissionalRepository professionalLinks,
            Clock clock,
            LocalTimeZoneResolver timeZones,
            LatestProgressService latestProgress,
            br.com.conectatea.notificacao.infrastructure.NotificacaoRepository notifications) {
        this.professionals = professionals;
        this.children = children;
        this.metas = metas;
        this.sessions = sessions;
        this.professionalLinks = professionalLinks;
        this.clock = clock;
        this.timeZones = timeZones;
        this.latestProgress = latestProgress;
        this.notifications = notifications;
    }

    /**
     * Dashboard do profissional autenticado.
     *
     * @param timezone identificador IANA opcional (ex.: "America/Sao_Paulo").
     *                 Fallback: America/Bahia. Ver política de fuso na Javadoc da classe.
     */
    @GetMapping("/profissional")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ProfessionalDashboard professional(
            Authentication authentication,
            @RequestParam(required = false) String timezone) {

        var professionalId = currentProfessionalId(authentication);
        var zone = timeZones.resolve(timezone);
        var now = clock.instant();
        var localNow = LocalDate.ofInstant(now, zone);

        var linkedChildren = children.findLinkedToProfessional(professionalId).stream()
                .filter(c -> c.getStatusAcompanhamento() == StatusAcompanhamento.EM_ACOMPANHAMENTO)
                .toList();
        var childIds = linkedChildren.stream().map(Crianca::getId).toList();

        var allGoals = childIds.isEmpty() ? List.<Meta>of() : metas.findByCriancaIdIn(childIds);
        long teamSize = childIds.isEmpty() ? 0
                : professionalLinks.countDistinctProfissionaisByCriancaIdInAndStatus(
                        childIds, StatusVinculo.VINCULADO);

        var monthStart = localNow.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        var nextMonth = localNow.withDayOfMonth(1).plusMonths(1).atStartOfDay(zone).toInstant();
        long teamJoinedThisMonth = childIds.isEmpty() ? 0
                : professionalLinks.countDistinctProfissionaisVinculadosNoPeriodo(
                        childIds, StatusVinculo.VINCULADO, monthStart, nextMonth);

        int activeGoals = (int) allGoals.stream()
                .filter(g -> g.getStatus() == StatusMeta.EM_ANDAMENTO)
                .count();

        var goalsThisMonth = allGoals.stream()
                .filter(g -> g.getCreatedAt() != null && !g.getCreatedAt().isBefore(monthStart))
                .toList();

        var userId = ((AuthenticatedUser) authentication.getPrincipal()).id();

        return new ProfessionalDashboard(
                linkedChildren.size(),
                linkedChildren.stream()
                        .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(monthStart))
                        .count(),
                teamSize,
                teamJoinedThisMonth,
                allGoals.size(),
                activeGoals,
                goalsThisMonth.size(),
                toProgressSummary(latestProgress.summarize(allGoals)),
                toProgressSummary(latestProgress.summarize(goalsThisMonth)),
                countWeekSessions(childIds, zone),
                notifications.countByDestinatarioUsuarioIdAndLidaFalse(userId),
                zone.getId());
    }

    /**
     * Lista resumida das crianças vinculadas ao profissional (EM_ACOMPANHAMENTO).
     */
    @GetMapping("/profissional/criancas")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public List<ChildDashboard> professionalChildren(Authentication authentication) {
        var today = LocalDate.ofInstant(clock.instant(), timeZones.resolve(null));
        return children.findLinkedToProfessional(currentProfessionalId(authentication)).stream()
                .filter(c -> c.getStatusAcompanhamento() == StatusAcompanhamento.EM_ACOMPANHAMENTO)
                .map(child -> ChildDashboard.from(child, today))
                .toList();
    }

    /**
     * Metas das crianças vinculadas ao profissional.
     */
    @GetMapping("/profissional/metas")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public List<GoalDashboard> professionalGoals(Authentication authentication) {
        var linkedChildren = children.findLinkedToProfessional(currentProfessionalId(authentication))
                .stream()
                .filter(c -> c.getStatusAcompanhamento() == StatusAcompanhamento.EM_ACOMPANHAMENTO)
                .toList();
        var childIds = linkedChildren.stream().map(Crianca::getId).toList();
        var goals = childIds.isEmpty() ? List.<Meta>of() : metas.findByCriancaIdIn(childIds);
        var names = children.findAllById(goals.stream().map(Meta::getCriancaId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Crianca::getId, Crianca::getNome));
        return goals.stream()
                .map(g -> GoalDashboard.from(g, names.get(g.getCriancaId())))
                .toList();
    }

    /**
     * Dashboard do responsável autenticado.
     *
     * @param timezone identificador IANA opcional. Fallback: America/Bahia.
     */
    @GetMapping("/responsavel")
    @PreAuthorize("hasRole('RESPONSAVEL')")
    public GuardianDashboard guardian(
            Authentication authentication,
            @RequestParam(required = false) String timezone) {

        var user = (AuthenticatedUser) authentication.getPrincipal();
        var zone = timeZones.resolve(timezone);
        var now = clock.instant();

        var linkedChildren = children.findLinkedToGuardian(user.id()).stream()
                .filter(c -> c.getStatusAcompanhamento() == StatusAcompanhamento.EM_ACOMPANHAMENTO)
                .toList();
        var ids = linkedChildren.stream().map(Crianca::getId).toList();
        var allGoals = ids.isEmpty() ? List.<Meta>of() : metas.findByCriancaIdIn(ids);

        long activeGoals = allGoals.stream()
                .filter(g -> g.getStatus() == StatusMeta.EM_ANDAMENTO)
                .count();

        var nowOffset = OffsetDateTime.ofInstant(now, zone);
        long upcomingSessions = ids.isEmpty() ? 0
                : sessions.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqual(
                        ids, StatusSessao.AGENDADA, nowOffset);

        return new GuardianDashboard(
                linkedChildren.size(),
                activeGoals,
                countWeekSessions(ids, zone),
                upcomingSessions,
                notifications.countByDestinatarioUsuarioIdAndLidaFalse(user.id()),
                toProgressSummary(latestProgress.summarize(allGoals)),
                zone.getId());
    }

    // ── helpers privados ─────────────────────────────────────────────────────

    private Long currentProfessionalId(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        return professionals.findByUsuarioId(user.id()).orElseThrow().getId();
    }

    /**
     * Conta sessões AGENDADA dentro da semana local: de segunda (inclusive) até segunda seguinte (exclusive).
     * A semana começa no primeiro MONDAY imediatamente anterior ou igual ao dia local de hoje.
     */
    private long countWeekSessions(List<Long> childIds, ZoneId zone) {
        if (childIds.isEmpty()) {
            return 0;
        }
        var today = LocalDate.ofInstant(clock.instant(), zone);
        var monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return sessions.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                childIds,
                StatusSessao.AGENDADA,
                monday.atStartOfDay(zone).toOffsetDateTime(),
                monday.plusWeeks(1).atStartOfDay(zone).toOffsetDateTime());
    }

    /** Converte o resumo canônico para o DTO público do dashboard. */
    private static ProgressSummary toProgressSummary(LatestProgressService.ProgressSummary summary) {
        return new ProgressSummary(
                summary.media(),
                summary.metasComDados(),
                summary.metasSemDados(),
                summary.metasPausadas(),
                summary.metasConcluidas());
    }

    // ── DTOs de resposta ─────────────────────────────────────────────────────

    /**
     * Dashboard do profissional.
     * fallback de fuso documentado no campo {@code fusoUtilizado}.
     */
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
            long notificacoesNaoLidas,
            String fusoUtilizado) {
    }

    public record GuardianDashboard(
            int totalCriancas,
            long metasAtivas,
            long sessoesSemana,
            long sessoesProximas,
            long notificacoesNaoLidas,
            ProgressSummary progressoAtual,
            String fusoUtilizado) {
    }

    /**
     * Resumo de progresso atual.
     * {@code media} é null quando nenhuma meta ativa tem registro de progresso.
     */
    public record ProgressSummary(
            Double media,
            int metasComDados,
            int metasSemDados,
            long metasPausadas,
            long metasConcluidas) {
    }

    public record ChildDashboard(Long id, String nome, int idade, String diagnostico) {
        static ChildDashboard from(Crianca child, LocalDate today) {
            return new ChildDashboard(
                    child.getId(),
                    child.getNome(),
                    Period.between(child.getDataNascimento(), today).getYears(),
                    child.getDiagnostico());
        }
    }

    public record GoalDashboard(Long id, String titulo, StatusMeta status, int progresso, String crianca) {
        static GoalDashboard from(Meta goal, String childName) {
            return new GoalDashboard(goal.getId(), goal.getTitulo(), goal.getStatus(), goal.getProgresso(), childName);
        }
    }
}
