package br.com.conectatea.notificacao.application;

public record NotificationEmail(String recipientName, String recipientEmail,
        String subject, String message) {
}
