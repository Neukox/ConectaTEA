package br.com.conectatea.anotacao.infrastructure;

import br.com.conectatea.anotacao.domain.VersaoAnotacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VersaoAnotacaoRepository extends JpaRepository<VersaoAnotacao,Long> {
    @Query("select coalesce(max(v.numero),0) from VersaoAnotacao v where v.anotacaoId=:id")
    int maiorNumero(@Param("id") Long id);
    List<VersaoAnotacao> findByAnotacaoIdOrderByNumeroDesc(Long anotacaoId);
}
