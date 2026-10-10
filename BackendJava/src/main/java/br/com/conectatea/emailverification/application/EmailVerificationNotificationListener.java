package br.com.conectatea.emailverification.application;

import br.com.conectatea.notificacao.application.*;
import org.slf4j.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.*;

@Component
public class EmailVerificationNotificationListener {
    private static final Logger log=LoggerFactory.getLogger(EmailVerificationNotificationListener.class);
    private final EmailNotificationSender sender;
    public EmailVerificationNotificationListener(EmailNotificationSender sender){this.sender=sender;}
    @Async("notificationEmailExecutor")
    @TransactionalEventListener(phase=TransactionPhase.AFTER_COMMIT)
    public void send(EmailVerificationRequestedEvent event){
        try { sender.send(new NotificationEmail(event.name(),event.email(),"Confirme seu email - ConectaTEA",
                "Confirme o controle do seu email usando este link: " + event.url().toASCIIString())); }
        catch(RuntimeException exception){log.error("Falha ao enviar verificação de email (tipo: {})",exception.getClass().getSimpleName());}
    }
}
