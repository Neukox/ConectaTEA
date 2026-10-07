package br.com.conectatea.notificacao.application;

public interface EmailNotificationSender {
    void send(NotificationEmail email);
}
