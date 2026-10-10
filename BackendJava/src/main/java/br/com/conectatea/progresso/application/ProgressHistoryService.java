package br.com.conectatea.progresso.application;

import br.com.conectatea.meta.domain.CategoriaMeta;
import br.com.conectatea.meta.domain.EventoMeta;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.progresso.domain.Progresso;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.YearMonth;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ProgressHistoryService {
    private final Clock clock;
    public ProgressHistoryService(Clock clock){this.clock=clock;}

    public Evolution calculate(List<Meta> metas,List<Progresso> progressos,List<EventoMeta> eventos,int months,ZoneId zone){
        if(months!=3&&months!=6&&months!=12)throw new IllegalArgumentException("meses deve ser 3, 6 ou 12");
        var progressByMeta=progressos.stream().sorted(Comparator.comparing(Progresso::getData).thenComparing(Progresso::getId,Comparator.nullsFirst(Long::compareTo))).collect(Collectors.groupingBy(Progresso::getMetaId,LinkedHashMap::new,Collectors.toList()));
        var eventsByMeta=eventos.stream().sorted(Comparator.comparing(EventoMeta::getData).thenComparing(EventoMeta::getId,Comparator.nullsFirst(Long::compareTo))).collect(Collectors.groupingBy(EventoMeta::getMetaId,LinkedHashMap::new,Collectors.toList()));
        var current=YearMonth.now(clock.withZone(zone));
        var series=new EnumMap<CategoriaMeta,List<Point>>(CategoriaMeta.class);
        for(var category:CategoriaMeta.values())series.put(category,new ArrayList<>());
        for(int offset=months-1;offset>=0;offset--){
            var month=current.minusMonths(offset);
            var start=month.atDay(1).atStartOfDay(zone).toInstant();
            var end=offset==0?clock.instant():month.plusMonths(1).atDay(1).atStartOfDay(zone).toInstant();
            for(var category:CategoriaMeta.values()){
                var values=new ArrayList<Integer>();int missing=0,paused=0;var changes=new ArrayList<Change>();
                for(var meta:metas){
                    if(meta.getCategoria()!=category)continue;
                    var created=meta.getDataInicio().atStartOfDay(zone).toInstant();
                    if(!created.isBefore(end))continue;
                    var state=stateAt(eventsByMeta.getOrDefault(meta.getId(),List.of()),end);
                    var concludedBefore=lastEvent(eventsByMeta.getOrDefault(meta.getId(),List.of()),"CONCLUIDA",start).isPresent() && stateAt(eventsByMeta.getOrDefault(meta.getId(),List.of()),start)==StatusMeta.CONCLUIDA;
                    if(concludedBefore)continue;
                    changes.addAll(changesIn(meta,eventsByMeta.getOrDefault(meta.getId(),List.of()),start,end,zone));
                    if(state==StatusMeta.PAUSADA){paused++;continue;}
                    var completed=lastEvent(eventsByMeta.getOrDefault(meta.getId(),List.of()),"CONCLUIDA",end);
                    if(completed.isPresent()&&!completed.get().getData().isBefore(start)){values.add(100);continue;}
                    var latest=progressByMeta.getOrDefault(meta.getId(),List.of()).stream().filter(p->p.getData().isBefore(end)).reduce((a,b)->b);
                    if(latest.isPresent())values.add(latest.get().getProgressoAtual());else missing++;
                }
                Double average=values.isEmpty()?null:values.stream().mapToInt(Integer::intValue).average().orElseThrow();
                series.get(category).add(new Point(month.toString(),average,values.size(),missing,paused,List.copyOf(changes),!changes.isEmpty()));
            }
        }
        var result=new EnumMap<CategoriaMeta,CategorySeries>(CategoriaMeta.class);
        series.forEach((category,points)->{var valid=points.stream().filter(p->p.average()!=null).toList();var trend=valid.size()<2?null:valid.get(valid.size()-1).average()-valid.get(0).average();result.put(category,new CategorySeries(points,trend,valid.size()<2));});
        return new Evolution(months,result,"PONTOS_PERCENTUAIS","Indicador operacional; não representa avaliação clínica",eventos.isEmpty(),"[início do mês, início do mês seguinte); mês atual termina no instante do Clock");
    }

    private StatusMeta stateAt(List<EventoMeta> events,Instant boundary){var state=StatusMeta.EM_ANDAMENTO;for(var event:events){if(!event.getData().isBefore(boundary))break;state=switch(event.getTipo()){case "PAUSA"->StatusMeta.PAUSADA;case "RETOMADA","REABERTA"->StatusMeta.EM_ANDAMENTO;case "CONCLUIDA"->StatusMeta.CONCLUIDA;default->state;};}return state;}
    private Optional<EventoMeta> lastEvent(List<EventoMeta> events,String type,Instant boundary){return events.stream().filter(e->e.getTipo().equals(type)&&e.getData().isBefore(boundary)).reduce((a,b)->b);}
    private List<Change> changesIn(Meta meta,List<EventoMeta> events,Instant start,Instant end,ZoneId zone){var changes=new ArrayList<Change>();var created=meta.getDataInicio().atStartOfDay(zone).toInstant();if(!created.isBefore(start)&&created.isBefore(end))changes.add(new Change("ENTRADA",meta.getId(),created));for(var e:events)if(!e.getData().isBefore(start)&&e.getData().isBefore(end)&&Set.of("PAUSA","RETOMADA","REABERTA","CONCLUIDA").contains(e.getTipo()))changes.add(new Change(e.getTipo(),meta.getId(),e.getData()));return changes;}
    public record Change(String tipo,Long metaId,Instant instante){}
    public record Point(String mes,Double average,int amostra,int metasSemDados,int metasPausadas,List<Change> alteracoes,boolean composicaoAlterada){}
    public record CategorySeries(List<Point> pontos,Double tendenciaPontosPercentuais,boolean historicoInsuficiente){}
    public record Evolution(int meses,Map<CategoriaMeta,CategorySeries> categorias,String unidade,String aviso,boolean historicoLegadoLimitado,String coorte){}
}
