package br.com.conectatea.passwordreset.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

class PasswordResetServiceTest {
    private static final Instant NOW=Instant.parse("2026-10-05T12:00:00Z");
    @Mock UsuarioRepository users;
    @Mock PasswordResetTokenRepository tokens;
    @Mock ApplicationEventPublisher events;
    @Mock AuditLogService audits;
    private BCryptPasswordEncoder encoder;
    private PasswordResetService service;

    @BeforeEach void setUp(){MockitoAnnotations.openMocks(this);encoder=new BCryptPasswordEncoder();service=new PasswordResetService(users,tokens,encoder,events,new PasswordResetProperties(Duration.ofMinutes(30),URI.create("https://app.example/redefinir-senha")),audits,Clock.fixed(NOW,ZoneOffset.UTC));}

    @Test void existingActiveUserCreatesOnlyHashAndPublishesSafeEvent(){var user=user(true);when(users.findByEmailForUpdate("user@example.com")).thenReturn(Optional.of(user));var saved=ArgumentCaptor.forClass(PasswordResetToken.class);var event=ArgumentCaptor.forClass(PasswordResetRequestedEvent.class);service.requestPasswordReset(" USER@example.com ");verify(tokens).invalidateActiveByUser(7L,NOW);verify(tokens).save(saved.capture());verify(events).publishEvent(event.capture());assertThat(event.getValue().userId()).isEqualTo(7L);assertThat(event.getValue().recipientEmail()).isEqualTo("user@example.com");assertThat(event.getValue().resetUrl().getQuery()).startsWith("token=");var raw=event.getValue().resetUrl().getQuery().substring(6);assertThat(saved.getValue().getTokenHash()).isEqualTo(hash(raw));assertThat(saved.getValue().getTokenHash()).doesNotContain(raw);assertThat(saved.getValue().getExpiresAt()).isEqualTo(NOW.plusSeconds(1800));assertThat(event.getValue().toString()).doesNotContain(raw);}
    @Test void unknownEmailHasSameSilentBehaviorWithoutEvent(){when(users.findByEmailForUpdate("none@example.com")).thenReturn(Optional.empty());service.requestPasswordReset("none@example.com");verify(tokens,org.mockito.Mockito.never()).save(any());verify(events,org.mockito.Mockito.never()).publishEvent(any());}
    @Test void inactiveUserDoesNotPublishEvent(){var user=user(false);when(users.findByEmailForUpdate("user@example.com")).thenReturn(Optional.of(user));service.requestPasswordReset("user@example.com");verify(tokens,org.mockito.Mockito.never()).save(any());verify(events,org.mockito.Mockito.never()).publishEvent(any());}
    @Test void validTokenChangesPasswordCredentialsTimestampAndBecomesSingleUse(){var user=user(true);var token=new PasswordResetToken(user,hash("raw"),NOW.plusSeconds(60),NOW);when(tokens.findByHashForUpdate(hash("raw"))).thenReturn(Optional.of(token));service.resetPassword("raw","NovaSenha123");assertThat(encoder.matches("NovaSenha123",user.getPasswordHash())).isTrue();assertThat(user.getCredentialsUpdatedAt()).isEqualTo(NOW);assertThat(token.getUsedAt()).isEqualTo(NOW);assertThatThrownBy(()->service.resetPassword("raw","OutraSenha123")).isInstanceOf(InvalidPasswordResetTokenException.class);}
    @Test void missingExpiredInvalidatedAndInactiveTokensUseGenericError(){when(tokens.findByHashForUpdate(hash("missing"))).thenReturn(Optional.empty());assertInvalid("missing");for(var token:java.util.List.of(new PasswordResetToken(user(true),hash("expired"),NOW,NOW.minusSeconds(60)),invalidatedToken(),new PasswordResetToken(user(false),hash("inactive"),NOW.plusSeconds(60),NOW))){when(tokens.findByHashForUpdate(token.getTokenHash())).thenReturn(Optional.of(token));assertInvalid(token.getTokenHash().equals(hash("expired"))?"expired":token.getTokenHash().equals(hash("inactive"))?"inactive":"invalidated");}}

    private void assertInvalid(String raw){assertThatThrownBy(()->service.resetPassword(raw,"NovaSenha123")).isInstanceOf(InvalidPasswordResetTokenException.class).hasMessage("Token de redefinição inválido ou expirado.");}
    private PasswordResetToken invalidatedToken(){var token=new PasswordResetToken(user(true),hash("invalidated"),NOW.plusSeconds(60),NOW);ReflectionTestUtils.setField(token,"invalidatedAt",NOW);return token;}
    private Usuario user(boolean active){var user=new Usuario("User","user@example.com",encoder.encode("AntigaSenha123"),null,null,TipoUsuario.RESPONSAVEL);ReflectionTestUtils.setField(user,"id",7L);if(!active)user.desativar();return user;}
    private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new RuntimeException(e);}}
}
