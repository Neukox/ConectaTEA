package br.com.conectatea.meta.api;

import br.com.conectatea.meta.domain.CategoriaMeta;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.PrioridadeMeta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.meta.infrastructure.MetaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.progresso.domain.Progresso;
import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.usuario.domain.TipoUsuario;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.function.Predicate;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
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
@RequestMapping("/metas")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Metas")
public class MetaController {
    private final MetaRepository metas;
    private final ProgressoRepository progress;
    private final ProfissionalRepository professionals;
    private final AuthorizationService authorization;

    public MetaController(
            MetaRepository metas,
            ProgressoRepository progress,
            ProfissionalRepository professionals,
            AuthorizationService authorization) {
        this.metas = metas;
        this.progress = progress;
        this.professionals = professionals;
        this.authorization = authorization;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public MetaResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateMetaRequest request) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        authorization.requireCrianca(user, request.criancaId());
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        validateDates(request.dataInicio(), request.dataFim());
        return MetaResponse.from(metas.save(new Meta(
                request.titulo(), request.descricao(), request.categoria(), request.prioridade(),
                request.dataInicio(), request.dataFim(), request.criancaId(), professional.getId())));
    }

    @GetMapping
    public List<MetaResponse> list(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId,
            @RequestParam(required = false) CategoriaMeta categoria,
            @RequestParam(required = false) PrioridadeMeta prioridade,
            @RequestParam(required = false) StatusMeta status,
            @RequestParam(required = false) String periodo,
            @RequestParam(required = false, defaultValue = "") String search) {
        return filtered(authentication, criancaId, categoria, prioridade, status, periodo, search)
                .stream().map(MetaResponse::from).toList();
    }

    @GetMapping("/resumo")
    public MetaSummary summary(Authentication authentication) {
        var all = allowed(authentication, null);
        var today = LocalDate.now();
        return new MetaSummary(
                all.size(),
                count(all, item -> item.getStatus() == StatusMeta.EM_ANDAMENTO),
                count(all, item -> item.getStatus() == StatusMeta.VENCENDO),
                count(all, item -> item.getStatus() == StatusMeta.CONCLUIDA));
    }

    @GetMapping("/{id}")
    public MetaResponse get(Authentication authentication, @PathVariable Long id) {
        var meta = metas.findById(id).orElseThrow();
        authorization.requireCrianca(
                (AuthenticatedUser) authentication.getPrincipal(), meta.getCriancaId());
        return MetaResponse.from(meta);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public MetaResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateMetaRequest request) {
        var meta = metas.findById(id).orElseThrow();
        authorization.requireCrianca(
                (AuthenticatedUser) authentication.getPrincipal(), meta.getCriancaId());
        validateDates(request.dataInicio(), request.dataFim());
        meta.update(
                request.titulo(), request.descricao(), request.categoria(), request.prioridade(),
                request.dataInicio(), request.dataFim());
        return MetaResponse.from(meta);
    }

    @PatchMapping("/{id}/progresso")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public MetaResponse updateProgress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressoRequest request) {
        var meta = metas.findById(id).orElseThrow();
        var user = (AuthenticatedUser) authentication.getPrincipal();
        authorization.requireCrianca(user, meta.getCriancaId());
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        var before = meta.getProgresso();
        meta.progress(request.progresso());
        progress.save(new Progresso(
                meta.getId(), professional.getId(), before, meta.getProgresso(),
                meta.getStatus(), request.descricao()));
        return MetaResponse.from(meta);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public void delete(Authentication authentication, @PathVariable Long id) {
        var meta = metas.findById(id).orElseThrow();
        authorization.requireCrianca(
                (AuthenticatedUser) authentication.getPrincipal(), meta.getCriancaId());
        metas.delete(meta);
    }

    private List<Meta> filtered(
            Authentication authentication,
            Long childId,
            CategoriaMeta category,
            PrioridadeMeta priority,
            StatusMeta status,
            String period,
            String search) {
        var normalized = search.trim().toLowerCase(Locale.ROOT);
        var today = LocalDate.now();
        return allowed(authentication, childId).stream()
                .filter(item -> category == null || item.getCategoria() == category)
                .filter(item -> priority == null || item.getPrioridade() == priority)
                .filter(item -> status == null || item.getStatus() == status)
                .filter(item -> matchesPeriod(item, period, today))
                .filter(item -> normalized.isBlank()
                        || contains(item.getTitulo(), normalized)
                        || contains(item.getDescricao(), normalized))
                .toList();
    }

    private List<Meta> allowed(Authentication authentication, Long childId) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        if (childId != null) {
            authorization.requireCrianca(user, childId);
            return metas.findByCriancaId(childId);
        }
        if (user.tipo() != TipoUsuario.PROFISSIONAL) {
            throw new AccessDeniedException("Filtro criancaId é obrigatório para responsável");
        }
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        return metas.findByProfissionalId(professional.getId());
    }

    private boolean matchesPeriod(Meta meta, String period, LocalDate today) {
        if (period == null || period.isBlank() || period.equalsIgnoreCase("TODOS")) {
            return true;
        }
        return switch (period.toUpperCase(Locale.ROOT)) {
            case "HOJE" -> meta.getDataFim().equals(today);
            case "SEMANA" -> !meta.getDataFim().isBefore(today)
                    && !meta.getDataFim().isAfter(today.plusDays(7));
            case "MES" -> !meta.getDataFim().isBefore(today)
                    && !meta.getDataFim().isAfter(today.plusMonths(1));
            case "ATRASADAS" -> meta.getDataFim().isBefore(today)
                    && meta.getStatus() != StatusMeta.CONCLUIDA;
            default -> throw new IllegalArgumentException("periodo inválido");
        };
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(search);
    }

    private long count(List<Meta> all, Predicate<Meta> predicate) {
        return all.stream().filter(predicate).count();
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("dataFim deve ser posterior à dataInicio");
        }
    }

    public record CreateMetaRequest(
            @NotBlank String titulo,
            String descricao,
            @NotNull CategoriaMeta categoria,
            @NotNull PrioridadeMeta prioridade,
            @NotNull @FutureOrPresent LocalDate dataInicio,
            @NotNull LocalDate dataFim,
            @NotNull Long criancaId) {
    }

    public record UpdateMetaRequest(
            @NotBlank String titulo,
            String descricao,
            @NotNull CategoriaMeta categoria,
            @NotNull PrioridadeMeta prioridade,
            @NotNull LocalDate dataInicio,
            @NotNull LocalDate dataFim) {
    }

    public record UpdateProgressoRequest(
            @Min(0) @Max(100) int progresso,
            String descricao) {
    }

    public record MetaResponse(
            Long id,
            String titulo,
            String descricao,
            CategoriaMeta categoria,
            PrioridadeMeta prioridade,
            StatusMeta status,
            int progresso,
            LocalDate dataInicio,
            LocalDate dataFim,
            Long criancaId) {
        static MetaResponse from(Meta meta) {
            return new MetaResponse(
                    meta.getId(), meta.getTitulo(), meta.getDescricao(), meta.getCategoria(),
                    meta.getPrioridade(), meta.getStatus(), meta.getProgresso(),
                    meta.getDataInicio(), meta.getDataFim(), meta.getCriancaId());
        }
    }

    public record MetaSummary(
            int totalMetas,
            long metasEmAndamento,
            long metasVencendo,
            long metasConcluidas) {
    }
}
