package br.com.conectatea.config;

import jakarta.validation.constraints.NotNull;
import java.net.URI;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.notification")
public record NotificationProperties(Email email) {
    public record Email(boolean enabled, @NotNull URI frontendUrl) {
    }
}
