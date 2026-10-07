package br.com.conectatea.vinculo.infrastructure;

import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VinculoProfissionalRepository extends JpaRepository<VinculoProfissionalCrianca, Long> {
    boolean existsByProfissionalIdAndCriancaIdAndStatus(Long profissionalId, Long criancaId, StatusVinculo status);
    List<VinculoProfissionalCrianca> findAllByCriancaIdAndStatus(Long criancaId, StatusVinculo status);
}
