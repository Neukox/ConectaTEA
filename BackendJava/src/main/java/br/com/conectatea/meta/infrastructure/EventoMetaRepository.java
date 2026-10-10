package br.com.conectatea.meta.infrastructure;
import br.com.conectatea.meta.domain.EventoMeta;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EventoMetaRepository extends JpaRepository<EventoMeta, Long> {}
