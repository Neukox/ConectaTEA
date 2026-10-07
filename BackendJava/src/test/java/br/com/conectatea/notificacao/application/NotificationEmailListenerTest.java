package br.com.conectatea.notificacao.application;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import java.util.List;
import org.junit.jupiter.api.Test;

class NotificationEmailListenerTest {
    @Test
    void falhaDoSenderNaoEscapaDoListenerPosCommit() {
        var sender = org.mockito.Mockito.mock(EmailNotificationSender.class);
        var email = new NotificationEmail("Ana", "ana@test.local", "Assunto", "Mensagem");
        doThrow(new NotificationEmailException("HTTP 500")).when(sender).send(email);
        var listener = new NotificationEmailListener(sender);

        assertThatCode(() -> listener.onNotificationsPersisted(
                new NotificationsPersistedEvent(List.of(email))))
                .doesNotThrowAnyException();
        verify(sender).send(email);
    }
}
