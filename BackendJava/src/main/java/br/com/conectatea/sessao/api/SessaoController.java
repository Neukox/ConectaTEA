package br.com.conectatea.sessao.api;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.sessao.domain.Sessao;
import br.com.conectatea.sessao.domain.StatusSessao;
import br.com.conectatea.sessao.domain.TipoSessao;
import br.com.conectatea.sessao.infrastructure.SessaoRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sessoes")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Sessões")
public class SessaoController {
    private final SessaoRepository sessions;
    private final CriancaRepository children;
    private final ProfissionalRepository professionals;
    private final AuthorizationService authorization;

    public SessaoController(
            SessaoRepository sessions,
            CriancaRepository children,
            ProfissionalRepository professionals,
            AuthorizationService authorization) {
        this.sessions = sessions;
        this.children = children;
        this.professionals = professionals;
        this.authorization = authorization;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public SessionResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateSessionRequest request) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        authorization.requireCrianca(user, request.criancaId());
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        return SessionResponse.from(sessions.save(new Sessao(
                request.dataHora(), request.duracao(), request.tipo(), request.descricao(),
                request.observacoes(), request.criancaId(), professional.getId())), true);
    }

    @GetMapping
    public List<SessionResponse> list(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId,
            @RequestParam(required = false) StatusSessao status,
            @RequestParam(required = false) TipoSessao tipo,
            @RequestParam(required = false) String periodo,
            @RequestParam(required = false, defaultValue = "") String search) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        var allowed = allowedSessions(user, criancaId);
        var normalized = search.trim().toLowerCase(Locale.ROOT);
        return allowed.stream()
                .filter(item -> status == null || item.getStatus() == status)
                .filter(item -> tipo == null || item.getTipo() == tipo)
                .filter(item -> matchesPeriod(item, periodo))
                .filter(item -> normalized.isBlank()
                        || contains(item.getDescricao(), normalized)
                        || (user.tipo() == TipoUsuario.PROFISSIONAL
                            && contains(item.getObservacoes(), normalized)))
                .map(item -> SessionResponse.from(item, user.tipo() == TipoUsuario.PROFISSIONAL))
                .toList();
    }

    @GetMapping("/{id}")
    public SessionResponse get(Authentication authentication, @PathVariable Long id) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        var session = sessions.findById(id).orElseThrow();
        authorization.requireCrianca(user, session.getCriancaId());
        return SessionResponse.from(session, user.tipo() == TipoUsuario.PROFISSIONAL);
    }

    @GetMapping("/resumo")
    public SessionSummary summary(Authentication authentication) {
        var all = allowedSessions((AuthenticatedUser) authentication.getPrincipal(), null);
        var now = OffsetDateTime.now();
        var start = now.with(DayOfWeek.MONDAY).toLocalDate();
        var end = start.plusDays(6);
        return new SessionSummary(
                all.stream().filter(item -> item.getDataHora().toLocalDate()
                        .equals(now.toLocalDate())).count(),
                all.stream().filter(item -> item.getStatus() == StatusSessao.CONCLUIDA).count(),
                all.stream().filter(item -> !item.getDataHora().toLocalDate().isBefore(start)
                        && !item.getDataHora().toLocalDate().isAfter(end)).count(),
                all.stream().filter(item -> item.getStatus() == StatusSessao.AGENDADA).count());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public SessionResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateSessionRequest request) {
        var session = sessions.findById(id).orElseThrow();
        requireAuthor(authentication, session);
        session.update(
                request.dataHora(), request.duracao(), request.tipo(),
                request.descricao(), request.observacoes());
        return SessionResponse.from(session, true);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public SessionResponse status(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody StatusRequest request) {
        var session = sessions.findById(id).orElseThrow();
        requireAuthor(authentication, session);
        session.status(request.status());
        return SessionResponse.from(session, true);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public void delete(Authentication authentication, @PathVariable Long id) {
        var session = sessions.findById(id).orElseThrow();
        requireAuthor(authentication, session);
        sessions.delete(session);
    }

    private void requireAuthor(Authentication authentication, Sessao session) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        authorization.requireCrianca(user, session.getCriancaId());
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        if (!session.getProfissionalId().equals(professional.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Somente o profissional autor pode alterar a sessão");
        }
    }

    private List<Sessao> allowedSessions(AuthenticatedUser user, Long childId) {
        if (childId != null) {
            authorization.requireCrianca(user, childId);
            return sessions.findByCriancaId(childId);
        }
        if (user.tipo() == TipoUsuario.PROFISSIONAL) {
            var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
            return sessions.findByProfissionalId(professional.getId());
        }
        return children.findLinkedToGuardian(user.id()).stream()
                .flatMap(child -> sessions.findByCriancaId(child.getId()).stream())
                .toList();
    }

    private boolean matchesPeriod(Sessao session, String period) {
        if (period == null || period.isBlank() || period.equalsIgnoreCase("TODOS")) {
            return true;
        }
        var date = session.getDataHora().toLocalDate();
        var today = OffsetDateTime.now().toLocalDate();
        var weekStart = today.with(DayOfWeek.MONDAY);
        var weekEnd = weekStart.plusDays(6);
        return switch (period.toUpperCase(Locale.ROOT)) {
            case "HOJE" -> date.equals(today);
            case "SEMANA" -> !date.isBefore(weekStart) && !date.isAfter(weekEnd);
            case "MES" -> !date.isBefore(today) && !date.isAfter(today.plusMonths(1));
            default -> throw new IllegalArgumentException("periodo inválido");
        };
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(search);
    }

    public record CreateSessionRequest(
            @NotNull Long criancaId,
            @NotNull TipoSessao tipo,
            @NotNull @FutureOrPresent OffsetDateTime dataHora,
            @Min(1) int duracao,
            String descricao,
            String observacoes) {
    }

    public record UpdateSessionRequest(
            @NotNull TipoSessao tipo,
            @NotNull OffsetDateTime dataHora,
            @Min(1) int duracao,
            String descricao,
            String observacoes) {
    }

    public record StatusRequest(@NotNull StatusSessao status) {
    }

    public record SessionResponse(
            Long id,
            OffsetDateTime dataHora,
            int duracao,
            StatusSessao status,
            TipoSessao tipo,
            String descricao,
            String observacoes,
            Long criancaId,
            Long autorProfissionalId) {
        static SessionResponse from(Sessao session, boolean includeInternalNotes) {
            return new SessionResponse(
                    session.getId(), session.getDataHora(), session.getDuracao(),
                    session.getStatus(), session.getTipo(), session.getDescricao(),
                    includeInternalNotes ? session.getObservacoes() : null,
                    session.getCriancaId(), session.getProfissionalId());
        }
    }

    public record SessionSummary(
            long sessoesHoje,
            long sessoesConcluidas,
            long sessoesEstaSemana,
            long sessoesPendentes) {
    }
}
