package br.com.conectatea.notificacao.application;

import java.util.List;

public interface CareRecipientsProvider {
    List<NotificationRecipient> findActiveRecipients(Long criancaId, Long actorUsuarioId);
}
