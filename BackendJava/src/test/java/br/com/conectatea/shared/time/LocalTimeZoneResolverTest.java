package br.com.conectatea.shared.time;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class LocalTimeZoneResolverTest {
    private final LocalTimeZoneResolver resolver = new LocalTimeZoneResolver();

    @Test
    void usaBahiaSomenteComoFallbackSemInformacaoConfiavel() {
        assertThat(resolver.resolve(null)).isEqualTo(ZoneId.of("America/Bahia"));
        assertThat(resolver.resolve(" ")).isEqualTo(ZoneId.of("America/Bahia"));
    }

    @Test
    void respeitaIanaExplicitoERejeitaValorInvalido() {
        assertThat(resolver.resolve("America/Manaus")).isEqualTo(ZoneId.of("America/Manaus"));
        assertThatThrownBy(() -> resolver.resolve("Bahia/Brasil"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("IANA");
    }
}
