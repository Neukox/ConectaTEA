package br.com.conectatea.notificacao.infrastructure;

import br.com.conectatea.config.BrevoProperties;
import br.com.conectatea.config.NotificationProperties;
import br.com.conectatea.notificacao.application.EmailNotificationSender;
import br.com.conectatea.notificacao.application.NotificationEmail;
import br.com.conectatea.notificacao.application.NotificationEmailException;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.net.http.HttpClient;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.HtmlUtils;

@Component
@ConditionalOnProperty(prefix = "app.notification.email", name = "enabled", havingValue = "true")
public class BrevoEmailNotificationSender implements EmailNotificationSender {
    private final RestClient client;
    private final BrevoProperties brevo;
    private final NotificationProperties notification;

    public BrevoEmailNotificationSender(RestClient.Builder builder, BrevoProperties brevo,
            NotificationProperties notification) {
        if (brevo.getApiKey().isBlank() || brevo.getSenderEmail().isBlank()
                || brevo.getSenderName().isBlank()) {
            throw new IllegalStateException(
                    "BREVO_API_KEY, BREVO_SENDER_EMAIL e BREVO_SENDER_NAME são obrigatórios quando e-mails de notificação estão habilitados");
        }
        this.brevo = brevo;
        this.notification = notification;
        var httpClient = HttpClient.newBuilder().connectTimeout(brevo.getConnectTimeout()).build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(brevo.getReadTimeout());
        this.client = builder.clone()
                .baseUrl(brevo.getBaseUrl().toString())
                .requestFactory(requestFactory)
                .defaultHeader("api-key", brevo.getApiKey())
                .build();
    }

    @Override
    public void send(NotificationEmail email) {
        var request = new EmailRequest(
                new Contact(brevo.getSenderName(), brevo.getSenderEmail()),
                List.of(new Contact(email.recipientName(), email.recipientEmail())),
                email.subject(), createHtml(email),
                brevo.isSandbox() ? Map.of("X-Sib-Sandbox", "drop") : null);
        try {
            client.post().uri("/v3/smtp/email")
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange((httpRequest, response) -> {
                        if (response.getStatusCode() != HttpStatus.CREATED) {
                            throw new NotificationEmailException(
                                    "Falha no provedor de e-mail (HTTP "
                                            + response.getStatusCode().value() + ")");
                        }
                        return null;
                    });
        } catch (NotificationEmailException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new NotificationEmailException(
                    "Falha de comunicação com o provedor de e-mail", exception);
        }
    }

    private String createHtml(NotificationEmail email) {
        var safeName = HtmlUtils.htmlEscape(email.recipientName());
        var safeMessage = HtmlUtils.htmlEscape(email.message());
        var safeUrl = HtmlUtils.htmlEscape(notification.email().frontendUrl().toASCIIString());
        return """
                <!doctype html><html lang="pt-BR"><body>
                <h1>ConectaTEA</h1>
                <p>Olá, %s.</p>
                <p>%s</p>
                <p>Acesse o ConectaTEA para visualizar as informações de acordo com suas permissões.</p>
                <p><a href="%s">Acessar o ConectaTEA</a></p>
                </body></html>
                """.formatted(safeName, safeMessage, safeUrl);
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record Contact(String name, String email) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record EmailRequest(Contact sender, List<Contact> to, String subject,
            String htmlContent, Map<String, String> headers) {}
}
