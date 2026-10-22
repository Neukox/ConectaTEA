package br.com.conectatea.notificacao.application;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
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
    private final Counter sent;
    private final Counter failed;

    public NotificationEmailListener(EmailNotificationSender sender, MeterRegistry meters) {
        this.sender = sender;
        this.sent = Counter.builder("conectatea.notification.email")
                .tag("result", "sent").register(meters);
        this.failed = Counter.builder("conectatea.notification.email")
                .tag("result", "failed").register(meters);
    }

    @Async("notificationEmailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNotificationsPersisted(NotificationsPersistedEvent event) {
        for (var email : event.emails()) {
            try {
                sender.send(email);
                sent.increment();
            } catch (NotificationEmailException exception) {
                failed.increment();
                log.error("Falha ao enviar e-mail de notificação: {}", exception.getMessage());
            } catch (RuntimeException exception) {
                failed.increment();
                log.error("Falha ao enviar e-mail de notificação (tipo: {})",
                        exception.getClass().getSimpleName());
            }
        }
    }
}
