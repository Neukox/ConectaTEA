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
import java.util.List;
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

    public DashboardController(
            ProfissionalRepository professionals,
            CriancaRepository children,
            MetaRepository metas,
            SessaoRepository sessions,
            ConexaoRepository connections) {
        this.professionals = professionals;
        this.children = children;
        this.metas = metas;
        this.sessions = sessions;
        this.connections = connections;
    }

    @GetMapping("/profissional")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ProfessionalDashboard professional(Authentication authentication) {
        var professional = currentProfessional(authentication);
        var linkedChildren = children.findLinkedToProfessional(professional);
        var professionalGoals = metas.findByProfissionalId(professional);
        var acceptedConnections = connections.findMine(professional).stream()
                .filter(item -> item.getStatus() == StatusConexao.ACEITO)
                .toList();
        var monthStart = LocalDate.now().withDayOfMonth(1)
                .atStartOfDay().toInstant(ZoneOffset.UTC);
        return new ProfessionalDashboard(
                linkedChildren.size(),
                linkedChildren.stream().filter(item -> item.getCreatedAt() != null
                        && !item.getCreatedAt().isBefore(monthStart)).count(),
                acceptedConnections.size(),
                acceptedConnections.stream().filter(item -> item.getCreatedAt() != null
                        && !item.getCreatedAt().isBefore(monthStart)).count(),
                professionalGoals.size(),
                professionalGoals.stream().filter(item -> item.getCreatedAt() != null
                        && !item.getCreatedAt().isBefore(monthStart)).count(),
                averageProgress(professionalGoals),
                averageProgress(professionalGoals.stream()
                        .filter(item -> item.getCreatedAt() != null
                                && !item.getCreatedAt().isBefore(monthStart))
                        .toList()));
    }

    @GetMapping("/profissional/criancas")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public List<ChildDashboard> professionalChildren(Authentication authentication) {
        return children.findLinkedToProfessional(currentProfessional(authentication)).stream()
                .map(ChildDashboard::from)
                .toList();
    }

    @GetMapping("/profissional/metas")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public List<GoalDashboard> professionalGoals(Authentication authentication) {
        return metas.findByProfissionalId(currentProfessional(authentication)).stream()
                .map(item -> GoalDashboard.from(item, children.findById(item.getCriancaId())
                        .orElseThrow().getNome()))
                .toList();
    }

    @GetMapping("/responsavel")
    @PreAuthorize("hasRole('RESPONSAVEL')")
    public GuardianDashboard guardian(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        var linkedChildren = children.findLinkedToGuardian(user.id());
        var ids = linkedChildren.stream().map(Crianca::getId).toList();
        var goals = ids.stream().flatMap(id -> metas.findByCriancaId(id).stream()).toList();
        var upcomingSessions = ids.stream()
                .flatMap(id -> sessions.findByCriancaId(id).stream())
                .filter(item -> item.getStatus() == StatusSessao.AGENDADA)
                .filter(item -> item.getDataHora().isAfter(java.time.OffsetDateTime.now()))
                .count();
        return new GuardianDashboard(
                linkedChildren.size(), goals.size(), upcomingSessions, averageProgress(goals));
    }

    private Long currentProfessional(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        return professionals.findByUsuarioId(user.id()).orElseThrow().getId();
    }

    private double averageProgress(List<Meta> goals) {
        return goals.stream().mapToInt(Meta::getProgresso).average().orElse(0);
    }

    public record ProfessionalDashboard(
            int totalCriancas,
            long criancasEsteMes,
            int profissionaisAtivos,
            long profissionaisAtivosEsteMes,
            int totalMetas,
            long totalMetasEsteMes,
            double taxaProgresso,
            double taxaProgressoEsteMes) {
    }

    public record GuardianDashboard(
            int totalCriancas,
            int totalMetas,
            long sessoesProximas,
            double taxaProgresso) {
    }

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
