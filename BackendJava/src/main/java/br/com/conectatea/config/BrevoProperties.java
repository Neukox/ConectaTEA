package br.com.conectatea.config;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.brevo")
public class BrevoProperties {
    private boolean enabled;
    private boolean sandbox;
    @NotNull private URI baseUrl = URI.create("https://api.brevo.com");
    private String apiKey = "";
    private String senderEmail = "";
    private String senderName = "ConectaTEA";
    @NotNull private Duration connectTimeout = Duration.ofSeconds(3);
    @NotNull private Duration readTimeout = Duration.ofSeconds(5);

    @AssertTrue(message = "BREVO_API_KEY e BREVO_SENDER_EMAIL são obrigatórios quando a Brevo está habilitada")
    public boolean isConfigurationValid() {
        return !enabled || (!apiKey.isBlank() && !senderEmail.isBlank() && !senderName.isBlank());
    }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public boolean isSandbox() { return sandbox; }
    public void setSandbox(boolean sandbox) { this.sandbox = sandbox; }
    public URI getBaseUrl() { return baseUrl; }
    public void setBaseUrl(URI baseUrl) { this.baseUrl = baseUrl; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public Duration getConnectTimeout() { return connectTimeout; }
    public void setConnectTimeout(Duration connectTimeout) { this.connectTimeout = connectTimeout; }
    public Duration getReadTimeout() { return readTimeout; }
    public void setReadTimeout(Duration readTimeout) { this.readTimeout = readTimeout; }
}
