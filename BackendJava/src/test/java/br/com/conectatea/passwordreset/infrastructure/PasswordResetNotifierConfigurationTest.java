package br.com.conectatea.passwordreset.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.config.BrevoProperties;
import br.com.conectatea.config.PasswordResetProperties;
import br.com.conectatea.passwordreset.application.PasswordResetNotifier;
import java.net.URI;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

class PasswordResetNotifierConfigurationTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(TestConfiguration.class, NoOpPasswordResetNotifier.class,
                    BrevoPasswordResetNotifier.class);

    @Test
    void usesNoOpWhenBrevoIsDisabled() {
        runner.withPropertyValues("app.brevo.enabled=false").run(context -> {
            assertThat(context).hasSingleBean(PasswordResetNotifier.class);
            assertThat(context.getBean(PasswordResetNotifier.class)).isInstanceOf(NoOpPasswordResetNotifier.class);
        });
    }

    @Test
    void usesBrevoWhenEnabledAndConfigured() {
        runner.withPropertyValues(
                "app.brevo.enabled=true",
                "app.brevo.api-key=test-key",
                "app.brevo.sender-email=sender@example.com")
                .run(context -> {
                    assertThat(context).hasSingleBean(PasswordResetNotifier.class);
                    assertThat(context.getBean(PasswordResetNotifier.class))
                            .isInstanceOf(BrevoPasswordResetNotifier.class);
                });
    }

    @Test
    void failsFastWhenEnabledWithoutRequiredCredentials() {
        runner.withPropertyValues("app.brevo.enabled=true")
                .run(context -> assertThat(context).hasFailed());
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(BrevoProperties.class)
    static class TestConfiguration {
        @Bean RestClient.Builder restClientBuilder() { return RestClient.builder(); }
        @Bean PasswordResetProperties passwordResetProperties() {
            return new PasswordResetProperties(Duration.ofMinutes(30), URI.create("http://frontend/reset"));
        }
    }
}
