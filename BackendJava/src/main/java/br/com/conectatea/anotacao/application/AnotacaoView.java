package br.com.conectatea.anotacao.application;

import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import java.time.Instant;

public record AnotacaoView(
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
        boolean isAutor) {
    public AnotacaoView(Long id,Long criancaId,String criancaNome,Long autorProfissionalId,String autorNome,String autorEspecialidade,String conteudo,VisibilidadeAnotacao visibilidade,Instant createdAt,Instant updatedAt,boolean isAutor){this(id,criancaId,criancaNome,autorProfissionalId,autorNome,autorEspecialidade,"Anotação",conteudo,null,null,visibilidade,createdAt,updatedAt,isAutor);}
}
