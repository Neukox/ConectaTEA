package br.com.conectatea.config;

import java.time.Clock;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({AppProperties.class, PasswordResetProperties.class})
public class ApplicationConfig {
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}

