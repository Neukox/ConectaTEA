package br.com.conectatea.passwordreset.infrastructure;

import br.com.conectatea.config.BrevoProperties;
import br.com.conectatea.config.PasswordResetProperties;
import br.com.conectatea.passwordreset.application.PasswordResetNotifier;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
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
@ConditionalOnProperty(prefix = "app.brevo", name = "enabled", havingValue = "true")
public class BrevoPasswordResetNotifier implements PasswordResetNotifier {
    private static final String SUBJECT = "Redefinição de senha - ConectaTEA";
    private final RestClient client;
    private final BrevoProperties properties;
    private final Duration tokenTtl;

    public BrevoPasswordResetNotifier(RestClient.Builder builder, BrevoProperties properties,
            PasswordResetProperties passwordResetProperties) {
        this.properties = properties;
        this.tokenTtl = passwordResetProperties.tokenTtl();
        var httpClient = HttpClient.newBuilder().connectTimeout(properties.getConnectTimeout()).build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.getReadTimeout());
        this.client = builder.clone()
                .baseUrl(properties.getBaseUrl().toString())
                .requestFactory(requestFactory)
                .defaultHeader("api-key", properties.getApiKey())
                .build();
    }

    @Override
    public void sendPasswordReset(String recipientEmail, URI resetUrl) {
        var request = new EmailRequest(
                new Contact(properties.getSenderName(), properties.getSenderEmail()),
                List.of(new Contact(null, recipientEmail)),
                SUBJECT,
                createHtml(resetUrl),
                properties.isSandbox() ? Map.of("X-Sib-Sandbox", "drop") : null);
        try {
            client.post().uri("/v3/smtp/email")
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange((httpRequest, response) -> {
                        if (response.getStatusCode() != HttpStatus.CREATED) {
                            throw new BrevoNotificationException(
                                    "Falha ao enviar notificação pela Brevo (HTTP "
                                            + response.getStatusCode().value() + ")");
                        }
                        return null;
                    });
        } catch (BrevoNotificationException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new BrevoNotificationException("Falha de comunicação com o provedor de e-mail", exception);
        }
    }

    private String createHtml(URI resetUrl) {
        String safeUrl = HtmlUtils.htmlEscape(resetUrl.toASCIIString());
        String validity = formatValidity(tokenTtl);
        return """
                <!doctype html><html lang="pt-BR"><body>
                <h1>ConectaTEA</h1>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                <p><a href="%s">Redefinir senha</a></p>
                <p>Este link expira em aproximadamente %s.</p>
                <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
                </body></html>
                """.formatted(safeUrl, validity);
    }

    private static String formatValidity(Duration ttl) {
        long minutes = ttl.toMinutes();
        if (minutes > 0 && ttl.equals(Duration.ofMinutes(minutes))) {
            return minutes + (minutes == 1 ? " minuto" : " minutos");
        }
        long hours = Math.max(1, ttl.toHours());
        return hours + (hours == 1 ? " hora" : " horas");
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record Contact(String name, String email) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record EmailRequest(Contact sender, List<Contact> to, String subject, String htmlContent,
            Map<String, String> headers) {}
}
