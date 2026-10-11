package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.passwordreset.application.InvalidPasswordResetTokenException;
import br.com.conectatea.passwordreset.application.PasswordResetService;
import br.com.conectatea.passwordreset.domain.PasswordResetToken;
import br.com.conectatea.passwordreset.infrastructure.PasswordResetTokenRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

class PasswordResetConcurrencyIntegrationTest extends PostgresIntegrationTest {
    @Autowired PasswordResetService service;
    @Autowired UsuarioRepository users;
    @Autowired PasswordResetTokenRepository tokens;
    @Autowired PasswordEncoder encoder;

    @Test void onlyOneSimultaneousRequestConsumesToken() throws Exception {
        var raw="concurrent-password-reset-token";
        var user=users.save(new Usuario("Concorrente","password-reset-concurrent@example.com",encoder.encode("SenhaAntiga123"),null,null,TipoUsuario.RESPONSAVEL));
        var token=tokens.save(new PasswordResetToken(user,hash(raw),Instant.now().plusSeconds(300),Instant.now()));
        var ready=new CountDownLatch(2);var start=new CountDownLatch(1);var successes=new AtomicInteger();var rejected=new AtomicInteger();
        try(var executor=Executors.newFixedThreadPool(2)){
            for(var i=0;i<2;i++)executor.submit(()->{ready.countDown();try{start.await();service.resetPassword(raw,"NovaSenha123");successes.incrementAndGet();}catch(InvalidPasswordResetTokenException e){rejected.incrementAndGet();}catch(InterruptedException e){Thread.currentThread().interrupt();}});
            assertThat(ready.await(5,TimeUnit.SECONDS)).isTrue();start.countDown();executor.shutdown();assertThat(executor.awaitTermination(10,TimeUnit.SECONDS)).isTrue();
        }
        assertThat(successes.get()).isEqualTo(1);assertThat(rejected.get()).isEqualTo(1);assertThat(tokens.findById(token.getId()).orElseThrow().getUsedAt()).isNotNull();var updated=users.findById(user.getId()).orElseThrow();assertThat(encoder.matches("NovaSenha123",updated.getPasswordHash())).isTrue();assertThat(updated.getCredentialsVersion()).isEqualTo(1);
    }

    @Test void simultaneousCredentialChangesDoNotLoseVersionOrTokenConsumption() throws Exception {
        var rawA="concurrent-token-a";var rawB="concurrent-token-b";
        var user=users.save(new Usuario("Duas operacoes","password-reset-two@example.com",encoder.encode("SenhaAntiga123"),null,null,TipoUsuario.RESPONSAVEL));
        var tokenA=tokens.save(new PasswordResetToken(user,hash(rawA),Instant.now().plusSeconds(300),Instant.now()));
        var tokenB=tokens.save(new PasswordResetToken(user,hash(rawB),Instant.now().plusSeconds(300),Instant.now()));
        var ready=new CountDownLatch(2);var start=new CountDownLatch(1);var successes=new AtomicInteger();
        try(var executor=Executors.newFixedThreadPool(2)){
            executor.submit(()->reset(rawA,"NovaSenhaA123",ready,start,successes));
            executor.submit(()->reset(rawB,"NovaSenhaB123",ready,start,successes));
            assertThat(ready.await(5,TimeUnit.SECONDS)).isTrue();start.countDown();executor.shutdown();assertThat(executor.awaitTermination(10,TimeUnit.SECONDS)).isTrue();
        }
        var updated=users.findById(user.getId()).orElseThrow();
        assertThat(successes.get()).isEqualTo(2);assertThat(updated.getCredentialsVersion()).isEqualTo(2);
        assertThat(encoder.matches("NovaSenhaA123",updated.getPasswordHash())||encoder.matches("NovaSenhaB123",updated.getPasswordHash())).isTrue();
        assertThat(tokens.findById(tokenA.getId()).orElseThrow().getUsedAt()).isNotNull();assertThat(tokens.findById(tokenB.getId()).orElseThrow().getUsedAt()).isNotNull();
    }

    private void reset(String raw,String password,CountDownLatch ready,CountDownLatch start,AtomicInteger successes){ready.countDown();try{start.await();service.resetPassword(raw,password);successes.incrementAndGet();}catch(InterruptedException e){Thread.currentThread().interrupt();}}

    private String hash(String value)throws Exception{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}
}
