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
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

class PasswordResetConcurrencyIntegrationTest extends PostgresIntegrationTest {
    @Autowired PasswordResetService service;
    @Autowired UsuarioRepository users;
    @Autowired PasswordResetTokenRepository tokens;
    @Autowired PasswordEncoder encoder;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transactionManager;

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

    @Test void tokenThatExpiresWhileResetWaitsForUserLockIsRejectedWithoutSideEffects() throws Exception {
        var raw="expires-while-waiting-for-lock";var oldPassword="SenhaAntiga123";
        var user=users.save(new Usuario("Expiracao no lock","password-reset-expiry-lock@example.com",encoder.encode(oldPassword),null,null,TipoUsuario.RESPONSAVEL));
        var expiresAt=Instant.now().plusSeconds(3);
        var token=tokens.save(new PasswordResetToken(user,hash(raw),expiresAt,Instant.now()));
        var locked=new CountDownLatch(1);var release=new CountDownLatch(1);
        try(var executor=Executors.newFixedThreadPool(2)){
            var holder=executor.submit(()->holdUserLock(user.getId(),locked,release));
            assertThat(locked.await(5,TimeUnit.SECONDS)).isTrue();
            Future<Boolean> reset=executor.submit(()->{
                try{service.resetPassword(raw,"NovaSenha123");return false;}
                catch(InvalidPasswordResetTokenException expected){return true;}
            });
            awaitDatabaseLockWait();
            assertThat(Instant.now()).isBefore(expiresAt);
            Thread.sleep(Duration.between(Instant.now(),expiresAt).plusMillis(100).toMillis());
            release.countDown();
            assertThat(reset.get(10,TimeUnit.SECONDS)).isTrue();
            holder.get(10,TimeUnit.SECONDS);
        } finally {release.countDown();}
        var unchanged=users.findById(user.getId()).orElseThrow();var unchangedToken=tokens.findById(token.getId()).orElseThrow();
        assertThat(encoder.matches(oldPassword,unchanged.getPasswordHash())).isTrue();
        assertThat(unchanged.getCredentialsVersion()).isZero();
        assertThat(unchangedToken.getUsedAt()).isNull();assertThat(unchangedToken.getInvalidatedAt()).isNull();
    }

    @Test void passwordResetRequestAndConsumptionAreSerializedWithoutDeadlock() throws Exception {
        var raw="request-versus-consumption";var oldPassword="SenhaAntiga123";var newPassword="NovaSenha123";
        var email="password-reset-request-consume@example.com";
        var user=users.save(new Usuario("Solicitacao e consumo",email,encoder.encode(oldPassword),null,null,TipoUsuario.RESPONSAVEL));
        var token=tokens.save(new PasswordResetToken(user,hash(raw),Instant.now().plusSeconds(300),Instant.now()));
        var ready=new CountDownLatch(2);var start=new CountDownLatch(1);
        boolean resetSucceeded;
        try(var executor=Executors.newFixedThreadPool(2)){
            var request=executor.submit(()->{ready.countDown();await(start);service.requestPasswordReset(email);});
            var reset=executor.submit(()->{ready.countDown();await(start);try{service.resetPassword(raw,newPassword);return true;}catch(InvalidPasswordResetTokenException expected){return false;}});
            assertThat(ready.await(5,TimeUnit.SECONDS)).isTrue();start.countDown();
            request.get(10,TimeUnit.SECONDS);resetSucceeded=reset.get(10,TimeUnit.SECONDS);
        }
        var updated=users.findById(user.getId()).orElseThrow();var oldToken=tokens.findById(token.getId()).orElseThrow();
        assertThat(oldToken.getUsedAt()!=null).isEqualTo(resetSucceeded);
        assertThat(oldToken.getInvalidatedAt()!=null).isEqualTo(!resetSucceeded);
        assertThat(updated.getCredentialsVersion()).isEqualTo(resetSucceeded?1:0);
        assertThat(encoder.matches(resetSucceeded?newPassword:oldPassword,updated.getPasswordHash())).isTrue();
        assertThat(tokens.countByUsuarioId(user.getId())).isEqualTo(2);
    }

    private void holdUserLock(Long userId,CountDownLatch locked,CountDownLatch release){new TransactionTemplate(transactionManager).executeWithoutResult(status->{users.findByIdForUpdate(userId).orElseThrow();locked.countDown();await(release);});}

    private void awaitDatabaseLockWait() throws InterruptedException {
        var deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(5);
        while(System.nanoTime()<deadline){
            var waiting=jdbc.queryForObject("select count(*) from pg_stat_activity where datname=current_database() and state='active' and wait_event_type='Lock'",Integer.class);
            if(waiting!=null&&waiting>0)return;
            Thread.sleep(25);
        }
        throw new AssertionError("Reset nao aguardou pelo bloqueio do usuario");
    }

    private void await(CountDownLatch latch){try{latch.await();}catch(InterruptedException e){Thread.currentThread().interrupt();throw new IllegalStateException(e);}}

    private void reset(String raw,String password,CountDownLatch ready,CountDownLatch start,AtomicInteger successes){ready.countDown();try{start.await();service.resetPassword(raw,password);successes.incrementAndGet();}catch(InterruptedException e){Thread.currentThread().interrupt();}}

    private String hash(String value)throws Exception{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}
}
