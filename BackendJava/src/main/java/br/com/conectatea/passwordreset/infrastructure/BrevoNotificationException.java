package br.com.conectatea.passwordreset.infrastructure;

public class BrevoNotificationException extends RuntimeException {
    BrevoNotificationException(String message) { super(message); }
    BrevoNotificationException(String message, Throwable cause) { super(message, cause); }
}
