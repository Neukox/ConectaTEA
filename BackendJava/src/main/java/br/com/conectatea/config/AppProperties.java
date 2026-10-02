package br.com.conectatea.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix="app")
public record AppProperties(@Valid Jwt jwt, @Valid Cors cors, @Valid Cookie cookie) {
    public record Jwt(@NotBlank @Size(min=32) String secret, @NotNull Duration expiration) {}
    public record Cors(@NotBlank String origins) {}
    public record Cookie(boolean secure, @NotBlank String sameSite) {}
}

