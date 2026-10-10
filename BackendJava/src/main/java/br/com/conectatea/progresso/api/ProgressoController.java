package br.com.conectatea.progresso.api;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.meta.domain.CategoriaMeta;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.meta.infrastructure.MetaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.progresso.domain.Progresso;
import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.time.Instant;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/progresso")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Progresso")
public class ProgressoController {
    private final MetaRepository metas;
    private final ProgressoRepository progress;
    private final CriancaRepository children;
    private final ProfissionalRepository professionals;
    private final AuthorizationService authorization;
    private final Clock clock;

    public ProgressoController(
            MetaRepository metas,
            ProgressoRepository progress,
            CriancaRepository children,
            ProfissionalRepository professionals,
            AuthorizationService authorization,
            Clock clock) {
        this.metas = metas;
        this.progress = progress;
        this.children = children;
        this.professionals = professionals;
        this.authorization = authorization;
        this.clock = clock;
    }

    @GetMapping("/resumo")
    public ProgressSummary summary(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId) {
        var allowed = allowedMetas(authentication, criancaId);
        return new ProgressSummary(
                allowed.stream().mapToInt(Meta::getProgresso).average().orElse(0),
                allowed.stream().filter(item -> item.getStatus() == StatusMeta.EM_ANDAMENTO).count(),
                allowed.stream().filter(item -> item.getStatus() == StatusMeta.CONCLUIDA).count(),
                allowed.stream().map(Meta::getCriancaId).distinct().count());
    }

    @GetMapping("/recentes")
    public List<ProgressResponse> recent(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId,
            @RequestParam(required = false, defaultValue = "SEMESTRAL") String periodo) {
        var allowed = allowedMetas(authentication, criancaId);
        var byId = allowed.stream().collect(Collectors.toMap(Meta::getId, Function.identity()));
        return history(allowed, periodo).stream()
                .limit(10)
                .map(item -> ProgressResponse.from(item, byId.get(item.getMetaId())))
                .toList();
    }

    @GetMapping("/historico")
    public ProgressHistory history(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId,
            @RequestParam(defaultValue = "6") int meses) {
        if (meses != 3 && meses != 6 && meses != 12) {
            throw new IllegalArgumentException("meses deve ser 3, 6 ou 12");
        }
        var allowed = allowedMetas(authentication, criancaId);
        var byId = allowed.stream().collect(Collectors.toMap(Meta::getId, Function.identity()));
        var inicioInclusivo = periodStart(meses);
        var points = historySince(allowed, inicioInclusivo).stream()
                .map(item -> ProgressResponse.from(item, byId.get(item.getMetaId())))
                .toList();
        return new ProgressHistory(meses, inicioInclusivo, Instant.now(clock), "DATA_DESC",
                points, points.size(), points.size() < 2);
    }

    @GetMapping("/distribuicao-categoria")
    public Map<CategoriaMeta, Long> distribution(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId) {
        return allowedMetas(authentication, criancaId).stream()
                .collect(Collectors.groupingBy(Meta::getCategoria, Collectors.counting()));
    }

    @GetMapping("/evolucao-categoria")
    public Map<CategoriaMeta, Double> evolution(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId,
            @RequestParam(required = false, defaultValue = "SEMESTRAL") String periodo) {
        var allowed = allowedMetas(authentication, criancaId);
        var byId = allowed.stream().collect(Collectors.toMap(Meta::getId, Function.identity()));
        var result = new EnumMap<CategoriaMeta, Double>(CategoriaMeta.class);
        history(allowed, periodo).stream()
                .filter(item -> byId.containsKey(item.getMetaId()))
                .collect(Collectors.groupingBy(
                        item -> byId.get(item.getMetaId()).getCategoria(),
                        Collectors.averagingInt(Progresso::getProgressoAtual)))
                .forEach(result::put);
        return result;
    }

    @GetMapping("/crianca")
    public List<ChildProgress> childProgress(
            Authentication authentication,
            @RequestParam(required = false) Long criancaId) {
        return allowedMetas(authentication, criancaId).stream()
                .collect(Collectors.groupingBy(Meta::getCriancaId))
                .entrySet().stream()
                .map(entry -> new ChildProgress(
                        children.findById(entry.getKey()).orElseThrow().getNome(),
                        entry.getValue().stream().mapToInt(Meta::getProgresso)
                                .average().orElse(0)))
                .toList();
    }

    private List<Meta> allowedMetas(Authentication authentication, Long childId) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        if (childId != null) {
            authorization.requireCrianca(user, childId);
            return metas.findByCriancaId(childId);
        }
        if (user.tipo() != TipoUsuario.PROFISSIONAL) {
            throw new AccessDeniedException("criancaId é obrigatório para responsável");
        }
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        return metas.findByProfissionalId(professional.getId());
    }

    private List<Progresso> history(List<Meta> allowed, String period) {
        var ids = allowed.stream().map(Meta::getId).toList();
        if (ids.isEmpty()) {
            return List.of();
        }
        var from = switch (period.toUpperCase(Locale.ROOT)) {
            case "SEMESTRAL" -> periodStart(6);
            case "ANUAL" -> periodStart(12);
            default -> throw new IllegalArgumentException("periodo inválido");
        };
        return progress.findByMetaIdInAndDataGreaterThanEqualAndDataLessThanOrderByDataDesc(
                ids, from, Instant.now(clock));
    }

    Instant periodStart(int months) {
        return LocalDate.now(clock).minusMonths(months)
                .atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private List<Progresso> historySince(List<Meta> allowed, Instant from) {
        var ids = allowed.stream().map(Meta::getId).toList();
        return ids.isEmpty() ? List.of()
                : progress.findByMetaIdInAndDataGreaterThanEqualAndDataLessThanOrderByDataDesc(
                        ids, from, Instant.now(clock));
    }

    public record ProgressHistory(int meses, Instant inicioInclusivo, Instant fimExclusivo,
                                  String ordenacao, List<ProgressResponse> pontos,
                                  int tamanhoAmostra, boolean historicoInsuficiente) {}

    public record ProgressSummary(
            double mediaProgresso,
            long metasAtivas,
            long metasConcluidas,
            long criancasAtivas) {
    }

    public record ChildProgress(String nome, double progresso) {
    }

    public record ProgressResponse(
            Long id,
            Instant data,
            String descricao,
            int diferenca,
            int progressoAtual,
            Long metaId,
            String metaTitulo,
            Long criancaId,
            Long autorProfissionalId,
            StatusMeta estadoMeta,
            String alertaLegado) {
        static ProgressResponse from(Progresso progress, Meta meta) {
            return new ProgressResponse(
                    progress.getId(),
                    progress.getData(),
                    progress.getDescricao(),
                    progress.getProgressoAtual() - progress.getProgressoAnterior(),
                    progress.getProgressoAtual(),
                    meta.getId(),
                    meta.getTitulo(),
                    meta.getCriancaId(), progress.getProfissionalId(), progress.getStatus(),
                    progress.getStatusLegado());
        }
    }
}
