package br.com.conectatea.dashboard.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import br.com.conectatea.dashboard.domain.EventoFeed;
import br.com.conectatea.dashboard.infrastructure.EventoFeedRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class FeedServiceTest {
    @Test
    void limitaSomenteAProjecaoDeApresentacaoDoFeed() {
        EventoFeedRepository repository = Mockito.mock(EventoFeedRepository.class);
        FeedService service = new FeedService(repository);
        String resultadoIntegral = "r".repeat(2_000);

        service.registrar(1L, 2L, "META_CONCLUIDA", "META", 3L,
                "t".repeat(250), resultadoIntegral, true);

        ArgumentCaptor<EventoFeed> captor = ArgumentCaptor.forClass(EventoFeed.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getTitulo()).hasSize(200);
        assertThat(captor.getValue().getResumo()).hasSize(500).endsWith("…");
        assertThat(resultadoIntegral).hasSize(2_000);
    }

    @Test
    void preservaResumoCurtoENulo() {
        assertThat(FeedService.resumir("resultado")).isEqualTo("resultado");
        assertThat(FeedService.resumir(null)).isNull();
    }
}
