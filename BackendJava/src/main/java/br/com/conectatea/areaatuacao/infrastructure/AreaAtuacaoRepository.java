package br.com.conectatea.areaatuacao.infrastructure;

import br.com.conectatea.areaatuacao.domain.AreaAtuacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AreaAtuacaoRepository extends JpaRepository<AreaAtuacao, Long> {
    List<AreaAtuacao> findAllByOrderByNomeAsc();
}
