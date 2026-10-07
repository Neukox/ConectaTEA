package br.com.conectatea.notificacao.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.notificacao.domain.Notificacao;
import br.com.conectatea.notificacao.domain.TipoNotificacao;
import br.com.conectatea.notificacao.infrastructure.NotificacaoRepository;
import br.com.conectatea.security.AuthenticatedUser;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
    private static final String TITLE = "Atualização no ConectaTEA";
    private static final String EMAIL_SUBJECT = "Nova atualização no ConectaTEA";

    private final NotificacaoRepository notificacoes;
    private final CareRecipientsProvider recipientsProvider;
    private final ApplicationEventPublisher events;
    private final AuditLogService auditoria;
    private final Clock clock;

    public NotificationService(NotificacaoRepository notificacoes,
            CareRecipientsProvider recipientsProvider, ApplicationEventPublisher events,
            AuditLogService auditoria, Clock clock) {
        this.notificacoes = notificacoes;
        this.recipientsProvider = recipientsProvider;
        this.events = events;
        this.auditoria = auditoria;
        this.clock = clock;
    }

    /** Deve ser chamado dentro da transação que altera a anotação. */
    public void registrarAlteracaoAnotacao(TipoNotificacao tipo, Long criancaId,
            String criancaNome, Long anotacaoId, Long atorUsuarioId, String atorNome) {
        var recipients = recipientsProvider.findActiveRecipients(criancaId, atorUsuarioId);
        if (recipients.isEmpty()) return;

        var mensagem = mensagem(tipo, atorNome, criancaNome);
        var now = Instant.now(clock);
        var entities = recipients.stream()
                .map(recipient -> new Notificacao(recipient.usuarioId(), atorUsuarioId,
                        criancaId, anotacaoId, tipo, TITLE, mensagem, now))
                .toList();
        notificacoes.saveAll(entities);

        var emails = recipients.stream()
                .map(recipient -> new NotificationEmail(recipient.nome(), recipient.email(),
                        EMAIL_SUBJECT, mensagem))
                .toList();
        events.publishEvent(new NotificationsPersistedEvent(emails));
    }

    @Transactional(readOnly = true)
    public List<NotificacaoView> listar(AuthenticatedUser usuario) {
        return notificacoes.findAllByDestinatarioUsuarioIdOrderByCreatedAtDesc(usuario.id())
                .stream().map(NotificacaoView::from).toList();
    }

    @Transactional(readOnly = true)
    public long contarNaoLidas(AuthenticatedUser usuario) {
        return notificacoes.countByDestinatarioUsuarioIdAndLidaFalse(usuario.id());
    }

    @Transactional
    public NotificacaoView marcarComoLida(AuthenticatedUser usuario, Long notificacaoId) {
        var notificacao = notificacoes.findByIdAndDestinatarioUsuarioId(notificacaoId, usuario.id())
                .orElseThrow(() -> new NoSuchElementException("Notificação não encontrada"));
        notificacao.marcarComoLida(clock);
        auditoria.record(usuario.id(), "NOTIFICATION_READ", "NOTIFICACAO", notificacaoId,
                notificacao.getCriancaId(), null, "SUCESSO", null);
        return NotificacaoView.from(notificacao);
    }

    @Transactional
    public int marcarTodasComoLidas(AuthenticatedUser usuario) {
        var updated = notificacoes.marcarTodasComoLidas(usuario.id(), Instant.now(clock));
        if (updated > 0) {
            auditoria.record(usuario.id(), "NOTIFICATIONS_READ_ALL", "NOTIFICACAO", null,
                    null, null, "SUCESSO", "quantidade=" + updated);
        }
        return updated;
    }

    static String mensagem(TipoNotificacao tipo, String atorNome, String criancaNome) {
        return switch (tipo) {
            case ANOTACAO_CRIADA -> "%s adicionou uma nova anotação compartilhada ao acompanhamento de %s."
                    .formatted(atorNome, criancaNome);
            case ANOTACAO_EDITADA -> "%s atualizou uma anotação compartilhada do acompanhamento de %s."
                    .formatted(atorNome, criancaNome);
            case ANOTACAO_EXCLUIDA -> "%s removeu uma anotação compartilhada do acompanhamento de %s."
                    .formatted(atorNome, criancaNome);
            case ANOTACAO_COMPARTILHADA -> "%s compartilhou uma anotação do acompanhamento de %s com o Círculo de Cuidado."
                    .formatted(atorNome, criancaNome);
            case ANOTACAO_TORNADA_PRIVADA -> "Uma anotação anteriormente compartilhada do acompanhamento de %s teve sua visibilidade alterada."
                    .formatted(criancaNome);
        };
    }
}
