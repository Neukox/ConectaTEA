package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.application.VinculoService;
import br.com.conectatea.vinculo.domain.StatusToken;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.TokenVinculo;
import br.com.conectatea.vinculo.infrastructure.TokenVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;

class TokenConcurrencyIntegrationTest extends PostgresIntegrationTest {
    @Autowired
    private VinculoService service;
    @Autowired
    private UsuarioRepository users;
    @Autowired
    private ProfissionalRepository professionals;
    @Autowired
    private CriancaRepository children;
    @Autowired
    private TokenVinculoRepository tokens;
    @Autowired
    private VinculoResponsavelRepository links;

    @Test
    void onlyOneSimultaneousConfirmationConsumesTokenAndCreatesCoherentLink() throws Exception {
        var code = "CONCURRENT-TOKEN-01";
        var guardian = users.save(new Usuario(
                "Responsável", "concorrente@example.com", "hash", null, null,
                TipoUsuario.RESPONSAVEL));
        var professionalUser = users.save(new Usuario(
                "Profissional", "profissional-concorrente@example.com", "hash", null, null,
                TipoUsuario.PROFISSIONAL));
        var professional = professionals.save(new Profissional(
                professionalUser.getId(), "PROF-CONCURRENT"));
        var child = children.save(new Crianca(
                "Criança concorrente", LocalDate.of(2018, 4, 12), null, null, null, null));
        var token = tokens.save(new TokenVinculo(
                sha256(code), child.getId(), professional.getId(),
                Instant.now().plus(1, ChronoUnit.HOURS)));
        var principal = new AuthenticatedUser(
                guardian.getId(), guardian.getEmail(), guardian.getTipo());

        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var successes = new AtomicInteger();
        var gone = new AtomicInteger();
        try (var executor = Executors.newFixedThreadPool(2)) {
            for (var attempt = 0; attempt < 2; attempt++) {
                executor.submit(() -> {
                    ready.countDown();
                    try {
                        start.await();
                        service.confirm(code, true, principal, "127.0.0.1", "integration-test");
                        successes.incrementAndGet();
                    } catch (ResponseStatusException exception) {
                        if (exception.getStatusCode().value() == 410) {
                            gone.incrementAndGet();
                        }
                    } catch (InterruptedException exception) {
                        Thread.currentThread().interrupt();
                    }
                });
            }
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            executor.shutdown();
            assertThat(executor.awaitTermination(10, TimeUnit.SECONDS)).isTrue();
        }

        assertThat(successes.get()).isEqualTo(1);
        assertThat(gone.get()).isEqualTo(1);
        assertThat(tokens.findById(token.getId()).orElseThrow().getStatus())
                .isEqualTo(StatusToken.USADO);
        assertThat(links.findAll())
                .filteredOn(link -> link.getResponsavelId().equals(guardian.getId())
                        && link.getCriancaId().equals(child.getId()))
                .singleElement()
                .extracting(link -> link.getStatus())
                .isEqualTo(StatusVinculo.VINCULADO);

        assertThatThrownBy(() -> service.confirm(
                code, true, principal, "127.0.0.1", "replay-test"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error)
                        .getStatusCode().value()).isEqualTo(410));
    }

    private String sha256(String value) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.toUpperCase().getBytes(StandardCharsets.UTF_8)));
    }
}
