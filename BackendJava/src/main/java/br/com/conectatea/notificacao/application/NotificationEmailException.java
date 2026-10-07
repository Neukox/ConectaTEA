package br.com.conectatea.notificacao.application;

public class NotificationEmailException extends RuntimeException {
    public NotificationEmailException(String message) {
        super(message);
    }

    public NotificationEmailException(String message, Throwable cause) {
        super(message, cause);
    }
}
