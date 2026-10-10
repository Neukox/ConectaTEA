package br.com.conectatea.progresso.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.meta.infrastructure.MetaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.shared.time.LocalTimeZoneResolver;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class ProgressoControllerPeriodTest {
    @Test
    void subtractsCalendarMonthsAcrossFebruary() {
        var controller = controllerAt("2024-03-31T12:00:00Z");
        assertThat(controller.periodStart(1)).isEqualTo(Instant.parse("2024-02-29T00:00:00Z"));
    }

    @Test
    void subtractsTwelveCalendarMonthsAcrossYearBoundary() {
        var controller = controllerAt("2025-01-15T12:00:00Z");
        assertThat(controller.periodStart(12)).isEqualTo(Instant.parse("2024-01-15T00:00:00Z"));
    }

    private ProgressoController controllerAt(String instant) {
        return new ProgressoController(mock(MetaRepository.class), mock(ProgressoRepository.class),
                mock(br.com.conectatea.meta.infrastructure.EventoMetaRepository.class),
                mock(CriancaRepository.class), mock(ProfissionalRepository.class),
                mock(AuthorizationService.class),
                mock(br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository.class),
                Clock.fixed(Instant.parse(instant), ZoneOffset.UTC), new LocalTimeZoneResolver(),
                new br.com.conectatea.progresso.application.ProgressHistoryService(Clock.fixed(Instant.parse(instant), ZoneOffset.UTC)));
    }
}
