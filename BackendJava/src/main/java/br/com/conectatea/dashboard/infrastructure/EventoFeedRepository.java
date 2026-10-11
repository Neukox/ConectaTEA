package br.com.conectatea.dashboard.infrastructure;

import br.com.conectatea.dashboard.domain.EventoFeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoFeedRepository extends JpaRepository<EventoFeed, Long> {
}
