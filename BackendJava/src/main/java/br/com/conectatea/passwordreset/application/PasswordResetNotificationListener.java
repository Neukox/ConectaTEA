package br.com.conectatea.passwordreset.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
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
    private final Counter sent;
    private final Counter failed;

    public PasswordResetNotificationListener(PasswordResetNotifier notifier,AuditLogService audits,MeterRegistry meters){
        this.notifier=notifier;this.audits=audits;
        this.sent=Counter.builder("conectatea.password_reset.email").tag("result","sent").register(meters);
        this.failed=Counter.builder("conectatea.password_reset.email").tag("result","failed").register(meters);
    }

    @Async("passwordResetExecutor")
    @TransactionalEventListener(phase=TransactionPhase.AFTER_COMMIT)
    public void onPasswordResetRequested(PasswordResetRequestedEvent event){
        audits.record(event.userId(),"PASSWORD_RESET_REQUESTED","USUARIO",event.userId(),null,null,"SUCESSO",null);
        try{notifier.sendPasswordReset(event.recipientEmail(),event.resetUrl());sent.increment();}
        catch(PasswordResetNotificationException exception){failed.increment();log.error("Falha ao enviar notificação de recuperação de senha: {}",exception.getMessage());}
        catch(RuntimeException exception){failed.increment();log.error("Falha ao enviar notificação de recuperação de senha (tipo: {})",exception.getClass().getSimpleName());}
    }
}
