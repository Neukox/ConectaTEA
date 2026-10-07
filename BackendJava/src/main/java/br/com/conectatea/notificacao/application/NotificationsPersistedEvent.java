package br.com.conectatea.notificacao.application;

import java.util.List;

public record NotificationsPersistedEvent(List<NotificationEmail> emails) {
    public NotificationsPersistedEvent {
        emails = List.copyOf(emails);
    }
}
