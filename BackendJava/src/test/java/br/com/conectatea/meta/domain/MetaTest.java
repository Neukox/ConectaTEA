package br.com.conectatea.meta.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class MetaTest {
    @ParameterizedTest
    @CsvSource({
            "0,EM_ANDAMENTO",
            "89,EM_ANDAMENTO",
            "90,QUASE_CONCLUIDA",
            "99,QUASE_CONCLUIDA",
            "100,CONCLUIDA"
    })
    void calculatesProgressStatus(int value, StatusMeta expected) {
        var meta = metaEndingAt(LocalDate.now().plusDays(30));
        meta.progress(value);
        assertThat(meta.getStatus()).isEqualTo(expected);
    }

    @Test
    void calculatesDueSoonFromCurrentDateAtReadTime() {
        assertThat(metaEndingAt(LocalDate.now().plusDays(7)).getStatus())
                .isEqualTo(StatusMeta.VENCENDO);
    }

    @Test
    void overdueGoalIsNotCountedAsDueSoon() {
        assertThat(metaEndingAt(LocalDate.now().minusDays(1)).getStatus())
                .isEqualTo(StatusMeta.EM_ANDAMENTO);
    }

    private Meta metaEndingAt(LocalDate end) {
        return new Meta(
                "Comunicação",
                "",
                CategoriaMeta.COMUNICACAO,
                PrioridadeMeta.MEDIA,
                end.minusDays(30),
                end,
                1L,
                1L);
    }
}
