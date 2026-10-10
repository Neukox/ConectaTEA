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

    private Meta meta(Long id,CategoriaMeta category,LocalDate start){var m=new Meta("Meta","Descrição",category,PrioridadeMeta.MEDIA,start,start.plusMonths(6),1L,1L);ReflectionTestUtils.setField(m,"id",id);return m;}
    private Progresso progress(Long metaId,int value,String instant,Long id){var p=new Progresso(metaId,1L,0,value,StatusMeta.EM_ANDAMENTO,"registro");ReflectionTestUtils.setField(p,"id",id);ReflectionTestUtils.setField(p,"data",Instant.parse(instant));return p;}
}
