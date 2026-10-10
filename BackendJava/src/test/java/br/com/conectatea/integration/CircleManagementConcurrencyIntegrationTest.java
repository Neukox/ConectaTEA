package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.application.CirculoService;
import br.com.conectatea.vinculo.domain.PapelCirculo;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.time.LocalDate;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class CircleManagementConcurrencyIntegrationTest extends PostgresIntegrationTest {
    @Autowired CirculoService service;
    @Autowired UsuarioRepository users;
    @Autowired CriancaRepository children;
    @Autowired VinculoResponsavelRepository links;

    @Test
    void concurrentTransferAndLegacyRouteLeaveNeverRemoveLastManager() throws Exception {
        var manager = users.save(new Usuario("Gestor", unique("gestor"), "hash", null, null, TipoUsuario.RESPONSAVEL));
        var target = users.save(new Usuario("Destino", unique("destino"), "hash", null, null, TipoUsuario.RESPONSAVEL));
        var child = children.save(new Crianca("Criança", LocalDate.of(2018, 1, 1), null, null, null, null));
        var managerLink = new VinculoResponsavelCrianca(manager.getId(), child.getId());
        managerLink.tornarGestor();
        links.save(managerLink);
        links.save(new VinculoResponsavelCrianca(target.getId(), child.getId()));

        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            executor.submit(() -> run(ready, start, () -> service.transferManagement(
                    principal(manager), child.getId(), target.getId())));
            executor.submit(() -> run(ready, start, () -> service.leave(
                    principal(manager), child.getId())));
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            executor.shutdown();
            assertThat(executor.awaitTermination(10, TimeUnit.SECONDS)).isTrue();
        }

        var active = links.findAllByCriancaIdAndStatus(child.getId(), StatusVinculo.VINCULADO);
        assertThat(active).anyMatch(link -> link.getPapel() == PapelCirculo.RESPONSAVEL_GESTOR);
    }

    private void run(CountDownLatch ready, CountDownLatch start, Runnable operation) {
        ready.countDown();
        try {
            start.await();
            operation.run();
        } catch (RuntimeException ignored) {
            // LAST_MANAGER é resultado válido quando a saída obtém o lock primeiro.
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }

    private AuthenticatedUser principal(Usuario user) {
        return new AuthenticatedUser(user.getId(), user.getEmail(), user.getTipo());
    }

    private String unique(String prefix) {
        return prefix + "-" + System.nanoTime() + "@example.test";
    }
}
