package br.com.conectatea.passwordreset.infrastructure;

import br.com.conectatea.passwordreset.application.PasswordResetNotifier;
import java.net.URI;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.brevo", name = "enabled", havingValue = "false", matchIfMissing = true)
public class NoOpPasswordResetNotifier implements PasswordResetNotifier {
    @Override
    public void sendPasswordReset(String recipientEmail, URI resetUrl) {
        // Adaptador temporário intencionalmente silencioso: nunca registra destinatário ou token.
    }
}
