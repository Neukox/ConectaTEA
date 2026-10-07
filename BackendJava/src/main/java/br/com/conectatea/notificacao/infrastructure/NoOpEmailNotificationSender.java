package br.com.conectatea.notificacao.infrastructure;

import br.com.conectatea.notificacao.application.EmailNotificationSender;
import br.com.conectatea.notificacao.application.NotificationEmail;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.notification.email", name = "enabled",
        havingValue = "false", matchIfMissing = true)
public class NoOpEmailNotificationSender implements EmailNotificationSender {
    @Override
    public void send(NotificationEmail email) {
        // Desenvolvimento/testes: não registra destinatário nem mensagem.
    }
}
