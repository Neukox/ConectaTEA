package br.com.conectatea.passwordreset.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.config.PasswordResetProperties;
import br.com.conectatea.passwordreset.domain.PasswordResetToken;
import br.com.conectatea.passwordreset.infrastructure.PasswordResetTokenRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

class PasswordResetServiceTest {
    private static final Instant NOW=Instant.parse("2026-10-05T12:00:00Z");
    @Mock UsuarioRepository users;
    @Mock PasswordResetTokenRepository tokens;
    @Mock PasswordResetNotifier notifier;
    @Mock AuditLogService audits;
    private BCryptPasswordEncoder encoder;
    private PasswordResetService service;

    @BeforeEach void setUp(){MockitoAnnotations.openMocks(this);encoder=new BCryptPasswordEncoder();service=new PasswordResetService(users,tokens,encoder,notifier,new PasswordResetProperties(Duration.ofMinutes(30),URI.create("https://app.example/redefinir-senha")),audits,Clock.fixed(NOW,ZoneOffset.UTC));}

    @Test void existingActiveUserCreatesOnlyHashInvalidatesOldAndNotifies(){var user=user(true);when(users.findByEmailForUpdate("user@example.com")).thenReturn(Optional.of(user));var saved=ArgumentCaptor.forClass(PasswordResetToken.class);var url=ArgumentCaptor.forClass(URI.class);service.requestPasswordReset(" USER@example.com ");verify(tokens).invalidateActiveByUser(7L,NOW);verify(tokens).save(saved.capture());verify(notifier).sendPasswordReset(org.mockito.ArgumentMatchers.eq("user@example.com"),url.capture());assertThat(saved.getValue().getTokenHash()).hasSize(64);assertThat(url.getValue().getQuery()).startsWith("token=");var raw=url.getValue().getQuery().substring(6);assertThat(saved.getValue().getTokenHash()).isEqualTo(hash(raw));assertThat(saved.getValue().getTokenHash()).doesNotContain(raw);assertThat(saved.getValue().getExpiresAt()).isEqualTo(NOW.plusSeconds(1800));}
    @Test void unknownEmailHasSameSilentBehaviorWithoutNotifier(){when(users.findByEmailForUpdate("none@example.com")).thenReturn(Optional.empty());service.requestPasswordReset("none@example.com");verify(tokens,never()).save(any());verify(notifier,never()).sendPasswordReset(any(),any());}
    @Test void inactiveUserDoesNotReceiveReset(){var user=user(false);when(users.findByEmailForUpdate("user@example.com")).thenReturn(Optional.of(user));service.requestPasswordReset("user@example.com");verify(tokens,never()).save(any());verify(notifier,never()).sendPasswordReset(any(),any());}
    @Test void validTokenChangesPasswordAndBecomesSingleUse(){var user=user(true);var token=new PasswordResetToken(user,hash("raw"),NOW.plusSeconds(60),NOW);when(tokens.findByHashForUpdate(hash("raw"))).thenReturn(Optional.of(token));service.resetPassword("raw","NovaSenha123");assertThat(encoder.matches("NovaSenha123",user.getPasswordHash())).isTrue();assertThat(token.getUsedAt()).isEqualTo(NOW);assertThatThrownBy(()->service.resetPassword("raw","OutraSenha123")).isInstanceOf(InvalidPasswordResetTokenException.class);}
    @Test void missingExpiredInvalidatedAndInactiveTokensUseGenericError(){when(tokens.findByHashForUpdate(hash("missing"))).thenReturn(Optional.empty());assertInvalid("missing");for(var token:java.util.List.of(new PasswordResetToken(user(true),hash("expired"),NOW,NOW.minusSeconds(60)),invalidatedToken(),new PasswordResetToken(user(false),hash("inactive"),NOW.plusSeconds(60),NOW))){when(tokens.findByHashForUpdate(token.getTokenHash())).thenReturn(Optional.of(token));assertInvalid(token.getTokenHash().equals(hash("expired"))?"expired":token.getTokenHash().equals(hash("inactive"))?"inactive":"invalidated");}}

    private void assertInvalid(String raw){assertThatThrownBy(()->service.resetPassword(raw,"NovaSenha123")).isInstanceOf(InvalidPasswordResetTokenException.class).hasMessage("Token de redefinição inválido ou expirado.");}
    private PasswordResetToken invalidatedToken(){var token=new PasswordResetToken(user(true),hash("invalidated"),NOW.plusSeconds(60),NOW);ReflectionTestUtils.setField(token,"invalidatedAt",NOW);return token;}
    private Usuario user(boolean active){var user=new Usuario("User","user@example.com",encoder.encode("AntigaSenha123"),null,null,TipoUsuario.RESPONSAVEL);ReflectionTestUtils.setField(user,"id",7L);if(!active)user.desativar();return user;}
    private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new RuntimeException(e);}}
}
