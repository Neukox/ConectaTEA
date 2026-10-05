package br.com.conectatea.passwordreset.infrastructure;

import br.com.conectatea.passwordreset.application.PasswordResetNotifier;
import java.net.URI;
import org.springframework.stereotype.Component;

@Component
public class NoOpPasswordResetNotifier implements PasswordResetNotifier {
    @Override
    public void sendPasswordReset(String recipientEmail, URI resetUrl) {
        // Adaptador temporário intencionalmente silencioso: nunca registra destinatário ou token.
    }
}
