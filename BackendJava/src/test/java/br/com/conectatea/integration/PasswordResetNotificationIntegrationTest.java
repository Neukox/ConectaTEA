package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.after;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import br.com.conectatea.passwordreset.application.PasswordResetNotifier;
import br.com.conectatea.passwordreset.application.PasswordResetService;
import br.com.conectatea.passwordreset.infrastructure.PasswordResetTokenRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.net.URI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.support.TransactionTemplate;

class PasswordResetNotificationIntegrationTest extends PostgresIntegrationTest {
    @Autowired PasswordResetService service;
    @Autowired UsuarioRepository users;
    @Autowired PasswordResetTokenRepository tokens;
    @Autowired PasswordEncoder encoder;
    @Autowired TransactionTemplate transactions;
    @MockitoBean PasswordResetNotifier notifier;

    @BeforeEach void clearNotifier(){clearInvocations(notifier);}

    @Test void notifierRunsOnlyAfterSuccessfulCommitWithCorrectUrl(){
        var user=saveUser("after-commit@example.com",true);
        transactions.executeWithoutResult(status->{service.requestPasswordReset(user.getEmail());verifyNoInteractions(notifier);});
        var url=ArgumentCaptor.forClass(URI.class);
        verify(notifier,timeout(5000)).sendPasswordReset(eq(user.getEmail()),url.capture());
        assertThat(url.getValue().getPath()).isEqualTo("/redefinir-senha");
        assertThat(url.getValue().getQuery()).startsWith("token=");
    }

    @Test void rollbackPreventsNotificationAndTokenPersistence(){
        var user=saveUser("rollback@example.com",true);
        assertThatThrownBy(()->transactions.executeWithoutResult(status->{service.requestPasswordReset(user.getEmail());throw new IllegalStateException("rollback test");})).isInstanceOf(IllegalStateException.class);
        verify(notifier,after(500).never()).sendPasswordReset(any(),any());
        assertThat(tokens.countByUsuarioId(user.getId())).isZero();
    }

    @Test void notifierFailureDoesNotRollbackPersistedToken(){
        var user=saveUser("notifier-failure@example.com",true);
        doThrow(new IllegalStateException("provider unavailable")).when(notifier).sendPasswordReset(any(),any());
        service.requestPasswordReset(user.getEmail());
        verify(notifier,timeout(5000)).sendPasswordReset(eq(user.getEmail()),any());
        assertThat(tokens.countByUsuarioId(user.getId())).isOne();
    }

    private Usuario saveUser(String email,boolean active){var user=new Usuario("Teste",email,encoder.encode("SenhaAntiga123"),null,null,TipoUsuario.RESPONSAVEL);if(!active)user.desativar();return users.saveAndFlush(user);}
}
