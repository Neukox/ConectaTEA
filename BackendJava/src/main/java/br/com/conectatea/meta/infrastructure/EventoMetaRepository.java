package br.com.conectatea.meta.infrastructure;
import br.com.conectatea.meta.domain.EventoMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface EventoMetaRepository extends JpaRepository<EventoMeta, Long> {
    List<EventoMeta> findByMetaIdInOrderByDataAsc(Collection<Long> metaIds);
}
