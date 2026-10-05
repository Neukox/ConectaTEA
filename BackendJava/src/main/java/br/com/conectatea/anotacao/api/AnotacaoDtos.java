package br.com.conectatea.anotacao.api;

import br.com.conectatea.anotacao.application.AnotacaoView;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class AnotacaoDtos {
    private AnotacaoDtos() {
    }

    @Schema(name = "CriarAnotacaoRequest")
    public record CreateRequest(
            @NotBlank @Size(min = 10, max = 3000)
            @Schema(example = "A criança respondeu bem aos combinados visuais.")
            String conteudo,
            @NotNull @Schema(example = "COMPARTILHADA")
            VisibilidadeAnotacao visibilidade) {
    }

    @Schema(name = "AtualizarAnotacaoRequest")
    public record UpdateRequest(
            @NotBlank @Size(min = 10, max = 3000)
            @Schema(example = "A criança respondeu bem aos combinados visuais atualizados.")
            String conteudo,
            @NotNull @Schema(example = "PRIVADA")
            VisibilidadeAnotacao visibilidade) {
    }

    @Schema(name = "AnotacaoResponse")
    public record Response(
            Long id,
            Long criancaId,
            String criancaNome,
            Long autorProfissionalId,
            String autorNome,
            String autorEspecialidade,
            String conteudo,
            VisibilidadeAnotacao visibilidade,
            Instant createdAt,
            Instant updatedAt,
            @Schema(description = "Conveniente para UX; não é mecanismo de autorização.")
            boolean isAutor) {
        static Response from(AnotacaoView view) {
            return new Response(
                    view.id(), view.criancaId(), view.criancaNome(),
                    view.autorProfissionalId(), view.autorNome(), view.autorEspecialidade(),
                    view.conteudo(), view.visibilidade(), view.createdAt(), view.updatedAt(),
                    view.isAutor());
        }
    }
}
