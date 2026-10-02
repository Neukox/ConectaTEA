package br.com.conectatea.redesocial.infrastructure;

import br.com.conectatea.redesocial.domain.RedeSocial;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RedeSocialRepository extends JpaRepository<RedeSocial, Long> {
    List<RedeSocial> findByProfissionalIdOrderByTipoAsc(Long profissionalId);
    Optional<RedeSocial> findByIdAndProfissionalId(Long id, Long profissionalId);
}
