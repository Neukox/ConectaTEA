package br.com.conectatea.emailverification.application;

public class InvalidEmailVerificationTokenException extends RuntimeException {
    public InvalidEmailVerificationTokenException() { super("Token de verificação inválido ou expirado."); }
}
