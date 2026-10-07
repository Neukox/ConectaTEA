package br.com.conectatea.notificacao.application;

import br.com.conectatea.notificacao.domain.Notificacao;
import br.com.conectatea.notificacao.domain.TipoNotificacao;
import java.time.Instant;

public record NotificacaoView(Long id, Long criancaId, Long anotacaoId, TipoNotificacao tipo,
        String titulo, String mensagem, boolean lida, Instant lidaEm, Instant createdAt) {
    public static NotificacaoView from(Notificacao notificacao) {
        return new NotificacaoView(notificacao.getId(), notificacao.getCriancaId(),
                notificacao.getAnotacaoId(), notificacao.getTipo(), notificacao.getTitulo(),
                notificacao.getMensagem(), notificacao.isLida(), notificacao.getLidaEm(),
                notificacao.getCreatedAt());
    }
}
