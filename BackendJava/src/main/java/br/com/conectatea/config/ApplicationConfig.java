package br.com.conectatea.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({AppProperties.class, PasswordResetProperties.class})
public class ApplicationConfig {}

