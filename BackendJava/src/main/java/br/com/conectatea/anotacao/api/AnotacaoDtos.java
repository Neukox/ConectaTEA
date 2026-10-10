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
            @Size(max = 100) String titulo,
            @NotBlank @Size(min = 10, max = 3000)
            @Schema(example = "A criança respondeu bem aos combinados visuais.")
            String conteudo,
            @NotNull @Schema(example = "COMPARTILHADA")
            VisibilidadeAnotacao visibilidade,
            @Size(max = 500) String temas,
            Long sessaoId) {
        public CreateRequest(String conteudo, VisibilidadeAnotacao visibilidade) { this(null, conteudo, visibilidade, null, null); }
        public String tituloResolvido() { return (titulo == null || titulo.isBlank()) ? "Anotação" : titulo; }
    }

    @Schema(name = "AtualizarAnotacaoRequest")
    public record UpdateRequest(
            @Size(max = 100) String titulo,
            @NotBlank @Size(min = 10, max = 3000)
            @Schema(example = "A criança respondeu bem aos combinados visuais atualizados.")
            String conteudo,
            @NotNull @Schema(example = "PRIVADA")
            VisibilidadeAnotacao visibilidade,
            @Size(max = 500) String temas,
            @Size(max = 500) String motivoCorrecao) {
        public UpdateRequest(String conteudo, VisibilidadeAnotacao visibilidade) { this(null, conteudo, visibilidade, null, null); }
    }

    @Schema(name = "AnotacaoResponse")
    public record Response(
            Long id,
            Long criancaId,
            String criancaNome,
            Long autorProfissionalId,
            String autorNome,
            String autorEspecialidade,
            String titulo,
            String conteudo,
            String temas,
            Long sessaoId,
            VisibilidadeAnotacao visibilidade,
            Instant createdAt,
            Instant updatedAt,
            @Schema(description = "Conveniente para UX; não é mecanismo de autorização.")
            boolean isAutor) {
        static Response from(AnotacaoView view) {
            return new Response(
                    view.id(), view.criancaId(), view.criancaNome(),
                    view.autorProfissionalId(), view.autorNome(), view.autorEspecialidade(), view.titulo(),
                    view.conteudo(), view.temas(), view.sessaoId(), view.visibilidade(), view.createdAt(), view.updatedAt(),
                    view.isAutor());
        }
    }
    @Schema(name = "ArquivoResponse")
    public record ArquivoResponse(
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
            Instant updatedAt) {
        public static ArquivoResponse from(br.com.conectatea.anotacao.application.ArquivoProprioView view) {
            return new ArquivoResponse(
                    view.id(), view.criancaId(), view.criancaNome(), view.snapshotCapturadoEm(),
                    view.snapshotOrigem(), view.snapshotHistoricoConfiavel(),
                    view.titulo(), view.conteudo(), view.temas(),
                    view.sessaoId(), view.visibilidade(),
                    view.createdAt(), view.updatedAt());
        }
    }

    public record VersaoResponse(Long id,int numero,String titulo,String conteudo,String temas,
                                 String motivoCorrecao,Long autorUsuarioId,Instant criadoEm) {
        static VersaoResponse from(br.com.conectatea.anotacao.domain.VersaoAnotacao v){return new VersaoResponse(v.getId(),v.getNumero(),v.getTitulo(),v.getConteudo(),v.getTemas(),v.getMotivo(),v.getAutor(),v.getCriadoEm());}
    }
}
