package br.com.conectatea.passwordreset.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

import br.com.conectatea.auditoria.application.AuditLogService;
import java.net.URI;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

@ExtendWith(OutputCaptureExtension.class)
class PasswordResetNotificationListenerTest {
    private static final String TOKEN = "sensitive-reset-token";
    private static final String API_KEY = "sensitive-api-key";

    @Test
    void logsOnlyExceptionTypeForUnexpectedFailureAndDoesNotPropagate(CapturedOutput output) {
        var notifier = mock(PasswordResetNotifier.class);
        var audits = mock(AuditLogService.class);
        var event = new PasswordResetRequestedEvent(1L,"recipient@example.com",
                URI.create("https://frontend/reset?token=" + TOKEN));
        doThrow(new IllegalStateException("provider failed " + TOKEN + " " + API_KEY))
                .when(notifier).sendPasswordReset(event.recipientEmail(),event.resetUrl());

        assertThatCode(() -> new PasswordResetNotificationListener(notifier,audits)
                .onPasswordResetRequested(event)).doesNotThrowAnyException();

        assertThat(output).contains("IllegalStateException")
                .doesNotContain(TOKEN)
                .doesNotContain(API_KEY)
                .doesNotContain(event.recipientEmail())
                .doesNotContain(event.resetUrl().toString());
    }

    @Test
    void logsSanitizedOperationalMessageWithoutStackTrace(CapturedOutput output) {
        var notifier = mock(PasswordResetNotifier.class);
        var event = new PasswordResetRequestedEvent(1L,"recipient@example.com",
                URI.create("https://frontend/reset?token=" + TOKEN));
        doThrow(new PasswordResetNotificationException("Falha do provedor (HTTP 429)"))
                .when(notifier).sendPasswordReset(event.recipientEmail(),event.resetUrl());

        new PasswordResetNotificationListener(notifier,mock(AuditLogService.class))
                .onPasswordResetRequested(event);

        assertThat(output).contains("Falha do provedor (HTTP 429)")
                .doesNotContain(TOKEN)
                .doesNotContain(event.recipientEmail())
                .doesNotContain("PasswordResetNotificationException:");
    }
}
