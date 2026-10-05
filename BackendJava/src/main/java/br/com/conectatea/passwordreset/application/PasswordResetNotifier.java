package br.com.conectatea.passwordreset.application;

import java.net.URI;

public interface PasswordResetNotifier {
    void sendPasswordReset(String recipientEmail, URI resetUrl);
}
