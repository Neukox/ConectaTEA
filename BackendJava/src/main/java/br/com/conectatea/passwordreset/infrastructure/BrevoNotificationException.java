package br.com.conectatea.passwordreset.infrastructure;

import br.com.conectatea.passwordreset.application.PasswordResetNotificationException;

public class BrevoNotificationException extends PasswordResetNotificationException {
    BrevoNotificationException(String message) { super(message); }
    BrevoNotificationException(String message, Throwable cause) { super(message, cause); }
}
