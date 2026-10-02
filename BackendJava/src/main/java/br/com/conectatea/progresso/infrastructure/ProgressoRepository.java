package br.com.conectatea.progresso.infrastructure;

import br.com.conectatea.progresso.domain.Progresso;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressoRepository extends JpaRepository<Progresso, Long> {
    List<Progresso> findByMetaIdInAndDataGreaterThanEqualOrderByDataDesc(
            Collection<Long> metaIds, Instant from);
}
