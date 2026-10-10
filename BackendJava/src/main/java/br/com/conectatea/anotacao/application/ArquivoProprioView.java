package br.com.conectatea.anotacao.application;

import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import java.time.Instant;

public record ArquivoProprioView(
        Long id,
        Long criancaId,
        String criancaNome,
        Instant snapshotCapturadoEm,
        String snapshotOrigem,
        boolean snapshotHistoricoConfiavel,
        String titulo,
        String conteudo,
        String temas,
        Long sessaoId,
        VisibilidadeAnotacao visibilidade,
        Instant createdAt,
        Instant updatedAt
) {
}
