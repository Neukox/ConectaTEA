package br.com.conectatea.emailverification.application;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import br.com.conectatea.config.EmailVerificationProperties;
import br.com.conectatea.emailverification.domain.EmailVerificationToken;
import br.com.conectatea.emailverification.infrastructure.EmailVerificationTokenRepository;
import br.com.conectatea.usuario.domain.*;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.net.URI;
import java.time.*;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

class EmailVerificationServiceTest {
 @Test void issuesHashedTokenAndConsumesItOnce(){
  var users=mock(UsuarioRepository.class);var tokens=mock(EmailVerificationTokenRepository.class);var events=mock(ApplicationEventPublisher.class);
  var clock=Clock.fixed(Instant.parse("2026-10-10T12:00:00Z"),ZoneOffset.UTC);var service=new EmailVerificationService(users,tokens,new EmailVerificationProperties(Duration.ofHours(24),Duration.ofMinutes(5),URI.create("https://app.example/verificar")),events,clock);
  var user=new Usuario("Pessoa","pessoa@example.com","hash",null,null,TipoUsuario.RESPONSAVEL);ReflectionTestUtils.setField(user,"id",9L);
  when(tokens.save(any())).thenAnswer(i->i.getArgument(0)); service.issueForRegistration(user);
  var event=org.mockito.ArgumentCaptor.forClass(EmailVerificationRequestedEvent.class);verify(events).publishEvent(event.capture());
  var raw=event.getValue().url().getQuery().substring("token=".length());var stored=org.mockito.ArgumentCaptor.forClass(EmailVerificationToken.class);verify(tokens).save(stored.capture());when(tokens.findByHashForUpdate(anyString())).thenReturn(Optional.of(stored.getValue()));
  service.confirm(raw);assertThat(user.isEmailConfirmado()).isTrue();assertThatThrownBy(()->service.confirm(raw)).isInstanceOf(InvalidEmailVerificationTokenException.class);
 }
}
