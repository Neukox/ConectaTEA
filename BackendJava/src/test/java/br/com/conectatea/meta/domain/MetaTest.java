package br.com.conectatea.meta.domain;
import static org.assertj.core.api.Assertions.assertThat;
import java.time.LocalDate;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
class MetaTest {
 @ParameterizedTest @CsvSource({"0,EM_ANDAMENTO","89,EM_ANDAMENTO","90,QUASE_CONCLUIDA","99,QUASE_CONCLUIDA","100,CONCLUIDA"})
 void calculatesStatus(int value,StatusMeta expected){var meta=new Meta("Comunicação","",CategoriaMeta.COMUNICACAO,PrioridadeMeta.MEDIA,LocalDate.now(),LocalDate.now().plusDays(30),1L,1L);meta.progress(value);assertThat(meta.getStatus()).isEqualTo(expected);}
}

