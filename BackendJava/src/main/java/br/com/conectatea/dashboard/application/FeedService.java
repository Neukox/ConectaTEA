package br.com.conectatea.dashboard.application;

import br.com.conectatea.dashboard.domain.EventoFeed;
import br.com.conectatea.dashboard.infrastructure.EventoFeedRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedService {
    private final EventoFeedRepository repository;

    public FeedService(EventoFeedRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void registrar(Long criancaId, Long atorUsuarioId, String tipo, String recursoTipo, Long recursoId, String titulo, String resumo, boolean compartilhado) {
        repository.save(new EventoFeed(criancaId, atorUsuarioId, tipo, recursoTipo, recursoId, titulo, resumo, compartilhado));
    }
}
