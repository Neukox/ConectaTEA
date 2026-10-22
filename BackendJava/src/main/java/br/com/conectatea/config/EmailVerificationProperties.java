package br.com.conectatea.config;

import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("app.email-verification")
public record EmailVerificationProperties(
        @NotNull Duration tokenTtl,
        @NotNull Duration resendInterval,
        @NotNull URI frontendUrl) {}
