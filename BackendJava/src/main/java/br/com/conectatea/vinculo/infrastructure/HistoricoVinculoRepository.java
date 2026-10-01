package br.com.conectatea.vinculo.infrastructure;
import br.com.conectatea.vinculo.domain.HistoricoVinculo; import org.springframework.data.jpa.repository.JpaRepository;
public interface HistoricoVinculoRepository extends JpaRepository<HistoricoVinculo,Long>{}
