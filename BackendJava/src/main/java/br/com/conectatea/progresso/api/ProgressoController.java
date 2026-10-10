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
import java.time.ZoneId;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
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

    @GetMapping("/resumo-atual")
    public CurrentSummary currentSummary(Authentication authentication,@RequestParam(required=false) Long criancaId){var allowed=allowedMetas(authentication,criancaId);var active=allowed.stream().filter(m->m.getStatus()==StatusMeta.EM_ANDAMENTO).toList();var ids=active.stream().map(Meta::getId).toList();var records=ids.isEmpty()?List.<Progresso>of():progress.findByMetaIdInOrderByDataAsc(ids);var latest=records.stream().collect(Collectors.toMap(Progresso::getMetaId,Function.identity(),(a,b)->b));var categories=new EnumMap<CategoriaMeta,CategoryCurrent>(CategoriaMeta.class);active.stream().collect(Collectors.groupingBy(Meta::getCategoria)).forEach((category,items)->{var known=items.stream().filter(m->latest.containsKey(m.getId())).toList();categories.put(category,new CategoryCurrent(known.isEmpty()?null:known.stream().mapToInt(m->latest.get(m.getId()).getProgressoAtual()).average().orElseThrow(),known.size(),items.size()-known.size()));});return new CurrentSummary(categories,active.size(),allowed.stream().filter(m->m.getStatus()==StatusMeta.PAUSADA).count(),allowed.stream().filter(m->m.getStatus()==StatusMeta.CONCLUIDA).count(),latest.size(),active.size()-latest.size());}

    @GetMapping("/evolucao-historica")
    public HistoricalEvolution historicalEvolution(Authentication authentication,@RequestParam(required=false) Long criancaId,@RequestParam(defaultValue="3") int meses){if(meses!=3&&meses!=6&&meses!=12)throw new IllegalArgumentException("meses deve ser 3, 6 ou 12");var allowed=allowedMetas(authentication,criancaId);var ids=allowed.stream().map(Meta::getId).toList();var records=ids.isEmpty()?List.<Progresso>of():progress.findByMetaIdInOrderByDataAsc(ids);var zone=ZoneId.of("America/Bahia");var current=YearMonth.now(clock);var points=new ArrayList<MonthlyPoint>();for(int offset=meses-1;offset>=0;offset--){var month=current.minusMonths(offset);var boundary=offset==0?Instant.now(clock):month.plusMonths(1).atDay(1).atStartOfDay(zone).toInstant();var eligible=allowed.stream().filter(m->!m.getDataInicio().isAfter(month.atEndOfMonth())).toList();var values=new ArrayList<Integer>();var missing=0;for(var meta:eligible){var value=records.stream().filter(p->p.getMetaId().equals(meta.getId())&&p.getData().isBefore(boundary)).reduce((a,b)->b);if(value.isPresent())values.add(value.get().getProgressoAtual());else missing++;}var average=values.isEmpty()?null:values.stream().mapToInt(Integer::intValue).average().orElseThrow();var changes=eligible.stream().filter(m->YearMonth.from(m.getDataInicio()).equals(month)).map(m->new CompositionChange("ENTRADA_META",m.getId())).toList();points.add(new MonthlyPoint(month.toString(),average,values.size(),missing,changes,!changes.isEmpty()));}var valid=points.stream().filter(p->p.media()!=null).toList();Double trend=valid.size()<2?null:valid.get(valid.size()-1).media()-valid.get(0).media();return new HistoricalEvolution(meses,points,trend,"PONTOS_PERCENTUAIS",valid.size()<2,points.stream().anyMatch(MonthlyPoint::composicaoAlterada),"Indicador operacional; não representa avaliação clínica",records.isEmpty());}

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
    public record CategoryCurrent(Double media,int metasComDados,int metasSemDados){}
    public record CurrentSummary(Map<CategoriaMeta,CategoryCurrent> categorias,int metasEmAndamento,long metasPausadas,long metasConcluidas,int metasComDados,int metasSemDados){}
    public record CompositionChange(String tipo,Long metaId){}
    public record MonthlyPoint(String mes,Double media,int amostra,int metasSemDados,List<CompositionChange> alteracoes,boolean composicaoAlterada){}
    public record HistoricalEvolution(int meses,List<MonthlyPoint> pontos,Double tendencia,String unidade,boolean historicoInsuficiente,boolean composicaoAlterada,String aviso,boolean historicoLegadoLimitado){}

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
