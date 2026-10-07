package br.com.conectatea.notificacao.api;

import br.com.conectatea.notificacao.application.NotificacaoView;
import br.com.conectatea.notificacao.domain.TipoNotificacao;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

public final class NotificacaoDtos {
    private NotificacaoDtos() {
    }

    @Schema(name = "NotificacaoResponse", description = "Evento persistente do usuário autenticado; não concede acesso ao recurso relacionado.")
    public record Response(Long id, Long criancaId, Long anotacaoId,
            @Schema(description = "Tipo semântico do evento") TipoNotificacao tipo,
            String titulo, String mensagem, boolean lida, Instant lidaEm, Instant createdAt) {
        static Response from(NotificacaoView view) {
            return new Response(view.id(), view.criancaId(), view.anotacaoId(), view.tipo(),
                    view.titulo(), view.mensagem(), view.lida(), view.lidaEm(), view.createdAt());
        }
    }

    @Schema(name = "NotificacoesNaoLidasCountResponse")
    public record CountResponse(@Schema(example = "3") long count) {
    }

    @Schema(name = "NotificacoesLidasResponse")
    public record ReadAllResponse(@Schema(example = "3") int updated) {
    }
}
