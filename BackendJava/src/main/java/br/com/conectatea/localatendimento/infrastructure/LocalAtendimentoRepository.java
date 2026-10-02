package br.com.conectatea.localatendimento.infrastructure;

import br.com.conectatea.localatendimento.domain.LocalAtendimento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocalAtendimentoRepository extends JpaRepository<LocalAtendimento, Long> {
    List<LocalAtendimento> findByProfissionalIdOrderByNomeAsc(Long profissionalId);
    Optional<LocalAtendimento> findByIdAndProfissionalId(Long id, Long profissionalId);
}
