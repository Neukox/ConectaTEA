package br.com.conectatea.passwordreset.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PasswordResetNotificationListener {
    private static final Logger log=LoggerFactory.getLogger(PasswordResetNotificationListener.class);
    private final PasswordResetNotifier notifier;
    private final AuditLogService audits;

    public PasswordResetNotificationListener(PasswordResetNotifier notifier,AuditLogService audits){this.notifier=notifier;this.audits=audits;}

    @Async("passwordResetExecutor")
    @TransactionalEventListener(phase=TransactionPhase.AFTER_COMMIT)
    public void onPasswordResetRequested(PasswordResetRequestedEvent event){
        audits.record(event.userId(),"PASSWORD_RESET_REQUESTED","USUARIO",event.userId(),null,null,"SUCESSO",null);
        try{notifier.sendPasswordReset(event.recipientEmail(),event.resetUrl());}
        catch(RuntimeException exception){log.error("Falha ao enviar notificação de recuperação de senha");}
    }
}
