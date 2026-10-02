package br.com.conectatea.areaatuacao.infrastructure;

import br.com.conectatea.areaatuacao.domain.AreaAtuacaoProfissional;
import br.com.conectatea.areaatuacao.domain.AreaAtuacaoProfissionalId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AreaAtuacaoProfissionalRepository extends JpaRepository<AreaAtuacaoProfissional, AreaAtuacaoProfissionalId> {
    List<AreaAtuacaoProfissional> findByProfissionalId(Long profissionalId);
}
