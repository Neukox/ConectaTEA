package br.com.conectatea.passwordreset.application;

/** Exceção cuja mensagem é deliberadamente sanitizada para diagnóstico operacional. */
public class PasswordResetNotificationException extends RuntimeException {
    public PasswordResetNotificationException(String safeMessage) { super(safeMessage); }
    public PasswordResetNotificationException(String safeMessage, Throwable cause) { super(safeMessage, cause); }
}
