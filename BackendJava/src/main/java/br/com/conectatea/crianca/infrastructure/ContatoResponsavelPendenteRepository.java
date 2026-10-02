package br.com.conectatea.crianca.infrastructure;

import br.com.conectatea.crianca.domain.ContatoResponsavelPendente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContatoResponsavelPendenteRepository
        extends JpaRepository<ContatoResponsavelPendente, Long> {
}
