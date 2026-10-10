package br.com.conectatea.meta.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.Instant;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import br.com.conectatea.shared.domain.BusinessRuleException;

class MetaTest {
    @Test
    void progressDoesNotImplicitlyChangeWorkState() {
        var meta = metaEndingAt(LocalDate.now().plusDays(30));
        meta.progress(100);
        assertThat(meta.getStatus()).isEqualTo(StatusMeta.EM_ANDAMENTO);
    }

    @Test
    void deadlineAlertIsNotAWorkState() {
        assertThat(metaEndingAt(LocalDate.now().plusDays(7)).getStatus())
                .isEqualTo(StatusMeta.EM_ANDAMENTO);
    }

    @Test
    void overdueGoalIsNotCountedAsDueSoon() {
        assertThat(metaEndingAt(LocalDate.now().minusDays(1)).getStatus())
                .isEqualTo(StatusMeta.EM_ANDAMENTO);
    }

    @Test
    void pausedGoalRejectsProgressAndCanResumeWithConfirmedDeadline() {
        var meta = metaEndingAt(LocalDate.now().plusDays(7));
        meta.pause("Reavaliação do plano", Instant.now());
        assertThat(meta.getStatus()).isEqualTo(StatusMeta.PAUSADA);
        assertThatThrownBy(() -> meta.progress(20))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("META_PAUSED");
        var newDeadline = LocalDate.now().plusDays(20);
        meta.resume(newDeadline);
        assertThat(meta.getStatus()).isEqualTo(StatusMeta.EM_ANDAMENTO);
        assertThat(meta.getDataFim()).isEqualTo(newDeadline);
    }

    @Test
    void completedGoalRejectsProgressAndPause() {
        var meta = metaEndingAt(LocalDate.now().plusDays(7));
        ReflectionTestUtils.setField(meta, "status", StatusMeta.CONCLUIDA);
        assertThatThrownBy(() -> meta.progress(100))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("META_COMPLETED");
        assertThatThrownBy(() -> meta.pause("motivo", Instant.now()))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("META_CANNOT_PAUSE");
    }

    @Test
    void activeGoalCannotResume() {
        assertThatThrownBy(() -> metaEndingAt(LocalDate.now().plusDays(7))
                .resume(LocalDate.now().plusDays(10)))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("META_CANNOT_RESUME");
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
