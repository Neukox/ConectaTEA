package br.com.conectatea.notificacao.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.notificacao.domain.Notificacao;
import br.com.conectatea.notificacao.domain.TipoNotificacao;
import br.com.conectatea.notificacao.infrastructure.NotificacaoRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    private static final Instant NOW = Instant.parse("2026-10-07T12:00:00Z");
    @Mock NotificacaoRepository repository;
    @Mock CareRecipientsProvider recipients;
    @Mock org.springframework.context.ApplicationEventPublisher events;
    @Mock AuditLogService auditoria;
    private NotificationService service;

    @BeforeEach
    void setup() {
        service = new NotificationService(repository, recipients, events, auditoria,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void persisteTodosDestinatariosEPublicaEmailSemConteudoClinico() {
        when(recipients.findActiveRecipients(10L, 1L)).thenReturn(List.of(
                new NotificationRecipient(2L, "Ana", "ana@test.local", TipoUsuario.PROFISSIONAL),
                new NotificationRecipient(3L, "Paula", "paula@test.local", TipoUsuario.RESPONSAVEL)));

        service.registrarAlteracaoAnotacao(TipoNotificacao.ANOTACAO_CRIADA,
                10L, "Maria", 20L, 1L, "João");

        @SuppressWarnings("unchecked")
        var entities = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(entities.capture());
        assertThat((List<Notificacao>) entities.getValue()).hasSize(2)
                .allSatisfy(item -> {
                    assertThat(item.getMensagem()).doesNotContain("conteúdo clínico secreto");
                    assertThat(item.getAtorUsuarioId()).isEqualTo(1L);
                });
        var event = ArgumentCaptor.forClass(NotificationsPersistedEvent.class);
        verify(events).publishEvent(event.capture());
        assertThat(event.getValue().emails()).hasSize(2)
                .allSatisfy(email -> assertThat(email.message())
                        .contains("Maria").doesNotContain("conteúdo clínico secreto"));
    }

    @Test
    void semDestinatariosNaoPersisteNemPublica() {
        when(recipients.findActiveRecipients(10L, 1L)).thenReturn(List.of());
        service.registrarAlteracaoAnotacao(TipoNotificacao.ANOTACAO_EDITADA,
                10L, "Maria", 20L, 1L, "João");
        verify(repository, never()).saveAll(any());
        verify(events, never()).publishEvent(any());
    }

    @Test
    void usuarioNaoMarcaNotificacaoAlheia() {
        when(repository.findByIdAndDestinatarioUsuarioId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.marcarComoLida(user(1L), 99L))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void contadorEListagemSaoEscopadosAoUsuario() {
        when(repository.countByDestinatarioUsuarioIdAndLidaFalse(2L)).thenReturn(3L);
        when(repository.findAllByDestinatarioUsuarioIdOrderByCreatedAtDesc(2L))
                .thenReturn(List.of());
        assertThat(service.contarNaoLidas(user(2L))).isEqualTo(3L);
        assertThat(service.listar(user(2L))).isEmpty();
        verify(repository).findAllByDestinatarioUsuarioIdOrderByCreatedAtDesc(2L);
    }

    @Test
    void marcaUmaETodasComoLidas() {
        var notification = new Notificacao(2L, 1L, 10L, 20L,
                TipoNotificacao.ANOTACAO_CRIADA, "Título", "Mensagem", NOW.minusSeconds(30));
        when(repository.findByIdAndDestinatarioUsuarioId(5L, 2L))
                .thenReturn(Optional.of(notification));
        when(repository.marcarTodasComoLidas(2L, NOW)).thenReturn(2);

        assertThat(service.marcarComoLida(user(2L), 5L).lida()).isTrue();
        assertThat(service.marcarTodasComoLidas(user(2L))).isEqualTo(2);
        verify(auditoria).record(2L, "NOTIFICATION_READ", "NOTIFICACAO", 5L,
                10L, null, "SUCESSO", null);
        verify(auditoria).record(2L, "NOTIFICATIONS_READ_ALL", "NOTIFICACAO", null,
                null, null, "SUCESSO", "quantidade=2");
    }

    private AuthenticatedUser user(Long id) {
        return new AuthenticatedUser(id, "user@test.local", TipoUsuario.RESPONSAVEL);
    }
}
