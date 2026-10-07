package br.com.conectatea.notificacao.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class NotificationEmailListener {
    private static final Logger log = LoggerFactory.getLogger(NotificationEmailListener.class);
    private final EmailNotificationSender sender;

    public NotificationEmailListener(EmailNotificationSender sender) {
        this.sender = sender;
    }

    @Async("notificationEmailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNotificationsPersisted(NotificationsPersistedEvent event) {
        for (var email : event.emails()) {
            try {
                sender.send(email);
            } catch (NotificationEmailException exception) {
                log.error("Falha ao enviar e-mail de notificação: {}", exception.getMessage());
            } catch (RuntimeException exception) {
                log.error("Falha ao enviar e-mail de notificação (tipo: {})",
                        exception.getClass().getSimpleName());
            }
        }
    }
}
