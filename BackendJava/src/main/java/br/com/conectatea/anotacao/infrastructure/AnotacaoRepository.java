package br.com.conectatea.anotacao.infrastructure;

import br.com.conectatea.anotacao.domain.Anotacao;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnotacaoRepository extends JpaRepository<Anotacao, Long> {
    @Query("""
            select a from Anotacao a
            join fetch a.crianca c
            join fetch a.autor p
            where c.id = :criancaId
              and (a.visibilidade = br.com.conectatea.anotacao.domain.VisibilidadeAnotacao.COMPARTILHADA
                   or p.id = :profissionalAtualId)
              and (:visibilidade is null or a.visibilidade = :visibilidade)
              and (:autorId is null or p.id = :autorId)
              and (:busca = '' or lower(a.conteudo) like lower(concat('%', :busca, '%')))
            """)
    List<Anotacao> findVisiveis(
            @Param("criancaId") Long criancaId,
            @Param("profissionalAtualId") Long profissionalAtualId,
            @Param("visibilidade") VisibilidadeAnotacao visibilidade,
            @Param("autorId") Long autorId,
            @Param("busca") String busca,
            Sort sort);

    @Query("""
            select a from Anotacao a
            join fetch a.crianca c
            join fetch a.autor p
            where a.id = :id and c.id = :criancaId
            """)
    Optional<Anotacao> findByIdAndCriancaId(
            @Param("id") Long id,
            @Param("criancaId") Long criancaId);
}
