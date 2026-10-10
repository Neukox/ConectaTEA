package br.com.conectatea.dashboard.application;

import br.com.conectatea.dashboard.domain.EventoFeed;
import br.com.conectatea.dashboard.infrastructure.EventoFeedRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedService {
    static final int LIMITE_TITULO = 200;
    static final int LIMITE_RESUMO = 500;
    private static final String SUFIXO_RESUMO = "…";

    private final EventoFeedRepository repository;

    public FeedService(EventoFeedRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void registrar(Long criancaId, Long atorUsuarioId, String tipo, String recursoTipo, Long recursoId, String titulo, String resumo, boolean compartilhado) {
        repository.save(new EventoFeed(criancaId, atorUsuarioId, tipo, recursoTipo, recursoId,
                limitar(titulo, LIMITE_TITULO, "Evento"), resumir(resumo), compartilhado));
    }

    /** O feed é uma projeção; o texto integral permanece no recurso e no histórico. */
    static String resumir(String valor) {
        if (valor == null || valor.length() <= LIMITE_RESUMO) {
            return valor;
        }
        return valor.substring(0, LIMITE_RESUMO - SUFIXO_RESUMO.length()) + SUFIXO_RESUMO;
    }

    private static String limitar(String valor, int limite, String fallback) {
        String normalizado = valor == null || valor.isBlank() ? fallback : valor;
        return normalizado.length() <= limite ? normalizado : normalizado.substring(0, limite);
    }
}
