package br.com.conectatea.passwordreset.application;

public class InvalidPasswordResetTokenException extends RuntimeException {
    public InvalidPasswordResetTokenException() {
        super("Token de redefinição inválido ou expirado.");
    }
}
