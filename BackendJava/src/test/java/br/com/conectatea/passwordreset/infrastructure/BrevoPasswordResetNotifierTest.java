package br.com.conectatea.passwordreset.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.conectatea.config.BrevoProperties;
import br.com.conectatea.config.PasswordResetProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.web.client.RestClient;

class BrevoPasswordResetNotifierTest {
    private static final String API_KEY = "test-secret-api-key";
    private static final String RESET_TOKEN = "sensitive-reset-token";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AtomicReference<CapturedRequest> captured = new AtomicReference<>();
    private HttpServer server;
    private int responseStatus;

    @BeforeEach
    void startServer() throws IOException {
        responseStatus = 201;
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v3/smtp/email", this::handle);
        server.start();
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    @Test
    void sendsExpectedTransactionalEmail() throws Exception {
        notifier(false).sendPasswordReset("destino@example.com", resetUrl());

        var request = captured.get();
        JsonNode json = objectMapper.readTree(request.body());
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.path()).isEqualTo("/v3/smtp/email");
        assertThat(request.apiKey()).isEqualTo(API_KEY);
        assertThat(request.accept()).contains("application/json");
        assertThat(request.contentType()).contains("application/json");
        assertThat(json.at("/sender/name").asText()).isEqualTo("ConectaTEA");
        assertThat(json.at("/sender/email").asText()).isEqualTo("remetente@example.com");
        assertThat(json.at("/to/0/email").asText()).isEqualTo("destino@example.com");
        assertThat(json.get("subject").asText()).isEqualTo("Redefinição de senha - ConectaTEA");
        assertThat(json.get("htmlContent").asText()).contains(RESET_TOKEN).contains("30 minutos");
        assertThat(json.has("textContent")).isFalse();
        assertThat(json.has("headers")).isFalse();
    }

    @Test
    void enablesBrevoSandboxThroughTransactionalEmailHeaders() throws Exception {
        notifier(true).sendPasswordReset("destino@example.com", resetUrl());
        JsonNode json = objectMapper.readTree(captured.get().body());
        assertThat(json.at("/headers/X-Sib-Sandbox").asText()).isEqualTo("drop");
    }

    @ParameterizedTest
    @MethodSource("errorStatuses")
    void sanitizesProviderErrors(int status) {
        responseStatus = status;
        assertThatThrownBy(() -> notifier(false).sendPasswordReset("destino@example.com", resetUrl()))
                .isInstanceOf(BrevoNotificationException.class)
                .hasMessageContaining("HTTP " + status)
                .hasMessageNotContaining(API_KEY)
                .hasMessageNotContaining(RESET_TOKEN);
    }

    private static Stream<Arguments> errorStatuses() {
        return Stream.of(Arguments.of(400), Arguments.of(401), Arguments.of(429), Arguments.of(500));
    }

    private BrevoPasswordResetNotifier notifier(boolean sandbox) {
        var properties = new BrevoProperties();
        properties.setEnabled(true);
        properties.setSandbox(sandbox);
        properties.setBaseUrl(URI.create("http://127.0.0.1:" + server.getAddress().getPort()));
        properties.setApiKey(API_KEY);
        properties.setSenderEmail("remetente@example.com");
        properties.setSenderName("ConectaTEA");
        return new BrevoPasswordResetNotifier(RestClient.builder(), properties,
                new PasswordResetProperties(Duration.ofMinutes(30), URI.create("http://frontend/reset")));
    }

    private static URI resetUrl() {
        return URI.create("https://frontend.example/redefinir-senha?token=" + RESET_TOKEN);
    }

    private void handle(HttpExchange exchange) throws IOException {
        byte[] body = exchange.getRequestBody().readAllBytes();
        captured.set(new CapturedRequest(exchange.getRequestMethod(), exchange.getRequestURI().getPath(),
                exchange.getRequestHeaders().getFirst("api-key"),
                exchange.getRequestHeaders().getFirst("Accept"),
                exchange.getRequestHeaders().getFirst("Content-Type"),
                new String(body, StandardCharsets.UTF_8)));
        byte[] response = responseStatus == 201 ? "{\"messageId\":\"test-id\"}".getBytes(StandardCharsets.UTF_8)
                : "{\"message\":\"provider detail must not escape\"}".getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(responseStatus, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }

    private record CapturedRequest(String method, String path, String apiKey, String accept,
            String contentType, String body) {}
}
