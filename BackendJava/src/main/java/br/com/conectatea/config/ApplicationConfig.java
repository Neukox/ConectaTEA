package br.com.conectatea.config;

import java.time.Clock;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableConfigurationProperties({AppProperties.class, PasswordResetProperties.class})
public class ApplicationConfig {
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean(name="passwordResetExecutor")
    Executor passwordResetExecutor(
            @Value("${app.password-reset.async.core-pool-size:1}") int corePoolSize,
            @Value("${app.password-reset.async.max-pool-size:2}") int maxPoolSize,
            @Value("${app.password-reset.async.queue-capacity:100}") int queueCapacity) {
        var executor=new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("password-reset-");
        executor.initialize();
        return executor;
    }
}

