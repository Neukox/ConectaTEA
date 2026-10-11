package br.com.conectatea.progresso.application;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.meta.domain.*;
import br.com.conectatea.progresso.domain.Progresso;
import java.time.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class ProgressHistoryServiceTest {
    private static final ZoneId ZONE=ZoneId.of("America/Bahia");
    private final Clock clock=Clock.fixed(Instant.parse("2026-03-15T12:00:00Z"),ZoneOffset.UTC);
    private final ProgressHistoryService service=new ProgressHistoryService(clock);

    @Test
    void calculaMediaETendenciaPorCategoriaComPesosIguais(){
        var first=meta(1L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,12,1));
        var second=meta(2L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,12,1));
        var result=service.calculate(List.of(first,second),List.of(
                progress(1L,40,"2026-01-10T12:00:00Z",1L),progress(2L,60,"2026-01-10T12:00:00Z",2L),
                progress(1L,60,"2026-02-10T12:00:00Z",3L),progress(2L,80,"2026-02-10T12:00:00Z",4L)),List.of(),3,ZONE);
        var points=result.categorias().get(CategoriaMeta.COMUNICACAO).pontos();
        assertThat(points.get(0).average()).isEqualTo(50);
        assertThat(points.get(1).average()).isEqualTo(70);
        assertThat(result.categorias().get(CategoriaMeta.COMUNICACAO).tendenciaPontosPercentuais()).isEqualTo(20);
    }

    @Test
    void entradaComZeroAlteraComposicaoSemTratarAusenciaComoZero(){
        var first=meta(1L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,12,1));
        var second=meta(2L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,12,1));
        var entered=meta(3L,CategoriaMeta.COMUNICACAO,LocalDate.of(2026,2,1));
        var result=service.calculate(List.of(first,second,entered),List.of(
                progress(1L,60,"2026-02-10T12:00:00Z",1L),progress(2L,80,"2026-02-10T12:00:00Z",2L),
                progress(3L,0,"2026-02-11T12:00:00Z",3L)),List.of(),3,ZONE);
        var feb=result.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(1);
        assertThat(feb.average()).isCloseTo(46.6667,org.assertj.core.data.Offset.offset(0.001));
        assertThat(feb.amostra()).isEqualTo(3);
        assertThat(feb.composicaoAlterada()).isTrue();
    }

    @Test
    void categoriasSaoIndependentesEAusenciaFicaExplicita(){
        var communication=meta(1L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,12,1));
        var autonomy=meta(2L,CategoriaMeta.AUTONOMIA,LocalDate.of(2025,12,1));
        var result=service.calculate(List.of(communication,autonomy),List.of(progress(1L,50,"2026-02-10T12:00:00Z",1L)),List.of(),3,ZONE);
        assertThat(result.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(1).average()).isEqualTo(50);
        assertThat(result.categorias().get(CategoriaMeta.AUTONOMIA).pontos().get(1).average()).isNull();
        assertThat(result.categorias().get(CategoriaMeta.AUTONOMIA).pontos().get(1).metasSemDados()).isEqualTo(1);
    }

    @Test
    void concluidaAntesDaJanelaSoVoltaAComporDepoisDeReabertura(){
        var goal=meta(1L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,1,1));
        var completed=event(1L,"CONCLUIDA","2025-12-10T12:00:00Z",1L);
        var withoutReopen=service.calculate(List.of(goal),List.of(progress(1L,100,"2025-12-10T12:00:00Z",1L)),List.of(completed),3,ZONE);
        assertThat(withoutReopen.categorias().get(CategoriaMeta.COMUNICACAO).pontos()).allMatch(p->p.amostra()==0);

        var reopened=event(1L,"REABERTA","2026-02-10T12:00:00Z",2L);
        var result=service.calculate(List.of(goal),List.of(
                progress(1L,100,"2025-12-10T12:00:00Z",1L),
                progress(1L,20,"2026-02-10T12:00:00Z",2L)),List.of(completed,reopened),3,ZONE);
        var feb=result.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(1);
        assertThat(feb.average()).isEqualTo(20);
        assertThat(feb.alteracoes()).extracting(ProgressHistoryService.Change::tipo).contains("REABERTA");
    }

    @Test
    void ultimaFaseDoMesPrevaleceSobreConclusoesAnteriores(){
        var goal=meta(1L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,1,1));
        var completed=event(1L,"CONCLUIDA","2026-02-05T12:00:00Z",1L);
        var reopened=event(1L,"REABERTA","2026-02-10T12:00:00Z",2L);
        var result=service.calculate(List.of(goal),List.of(
                progress(1L,100,"2026-02-05T12:00:00Z",1L),progress(1L,30,"2026-02-10T12:00:00Z",2L)),
                List.of(completed,reopened),3,ZONE);
        assertThat(result.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(1).average()).isEqualTo(30);

        var concludedAgain=event(1L,"CONCLUIDA","2026-02-12T12:00:00Z",3L);
        var again=service.calculate(List.of(goal),List.of(progress(1L,30,"2026-02-10T12:00:00Z",2L)),
                List.of(completed,reopened,concludedAgain),3,ZONE);
        assertThat(again.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(1).average()).isEqualTo(100);
    }

    @Test
    void reabertaEPausadaFicaForaDaMediaERetomadaPosteriorRestauraComposicao(){
        var goal=meta(1L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,1,1));
        var events=List.of(event(1L,"CONCLUIDA","2025-12-01T12:00:00Z",1L),
                event(1L,"REABERTA","2026-01-05T12:00:00Z",2L),event(1L,"PAUSA","2026-01-20T12:00:00Z",3L),
                event(1L,"RETOMADA","2026-02-02T12:00:00Z",4L));
        var result=service.calculate(List.of(goal),List.of(progress(1L,25,"2026-01-05T12:00:00Z",1L)),events,3,ZONE);
        var jan=result.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(0);
        var feb=result.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(1);
        assertThat(jan.average()).isNull();assertThat(jan.metasPausadas()).isEqualTo(1);
        assertThat(feb.average()).isEqualTo(25);assertThat(feb.alteracoes()).extracting(ProgressHistoryService.Change::tipo).contains("RETOMADA");
    }

    @Test
    void desempataEventosPorIdENaoUsaProgressoFuturo(){
        var goal=meta(1L,CategoriaMeta.COMUNICACAO,LocalDate.of(2025,1,1));
        var same="2026-02-10T12:00:00Z";
        var result=service.calculate(List.of(goal),List.of(progress(1L,35,same,1L),progress(1L,90,"2026-03-20T12:00:00Z",2L)),
                List.of(event(1L,"CONCLUIDA",same,1L),event(1L,"REABERTA",same,2L)),3,ZONE);
        assertThat(result.categorias().get(CategoriaMeta.COMUNICACAO).pontos().get(1).average()).isEqualTo(35);
    }

    private Meta meta(Long id,CategoriaMeta category,LocalDate start){var m=new Meta("Meta","Descrição",category,PrioridadeMeta.MEDIA,start,start.plusMonths(6),1L,1L);ReflectionTestUtils.setField(m,"id",id);return m;}
    private Progresso progress(Long metaId,int value,String instant,Long id){var p=new Progresso(metaId,1L,0,value,StatusMeta.EM_ANDAMENTO,"registro");ReflectionTestUtils.setField(p,"id",id);ReflectionTestUtils.setField(p,"data",Instant.parse(instant));return p;}
    private EventoMeta event(Long metaId,String type,String instant,Long id){var e=new EventoMeta(metaId,1L,type,"motivo",null,null);ReflectionTestUtils.setField(e,"id",id);ReflectionTestUtils.setField(e,"data",Instant.parse(instant));return e;}
}
