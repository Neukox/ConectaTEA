package br.com.conectatea.security;

import br.com.conectatea.config.AppProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    RateLimitFilter rateLimitFilter(ObjectMapper mapper,
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            @Value("${app.rate-limit.login-per-minute:10}") int loginLimit,
            @Value("${app.rate-limit.token-per-minute:30}") int tokenLimit) {
        return new RateLimitFilter(mapper, enabled, loginLimit, tokenLimit);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties properties) {
        var configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(properties.cors().origins().split(","))
                .map(String::trim)
                .toList());
        configuration.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Content-Type", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwt,
            RateLimitFilter rateLimit,
            ObjectMapper objectMapper) throws Exception {
        var csrf = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrf.setCookiePath("/");

        return http
                .cors(cors -> { })
                .csrf(configurer -> configurer
                        .csrfTokenRepository(csrf)
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                        .ignoringRequestMatchers("/auth/login", "/users/register"))
                .sessionManagement(configurer -> configurer
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> writeError(
                                objectMapper, response, 401, "UNAUTHORIZED",
                                "Autenticação necessária", request.getRequestURI()))
                        .accessDeniedHandler((request, response, exception) -> writeError(
                                objectMapper, response, 403, "ACCESS_DENIED",
                                "Acesso negado", request.getRequestURI())))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/auth/login",
                                "/users/register",
                                "/docs/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .addFilterBefore(rateLimit, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwt, RateLimitFilter.class)
                .build();
    }

    private static void writeError(
            ObjectMapper objectMapper,
            HttpServletResponse response,
            int status,
            String code,
            String message,
            String path) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        var body = new LinkedHashMap<String, Object>();
        body.put("timestamp", Instant.now());
        body.put("status", status);
        body.put("error", status == 401 ? "Unauthorized" : "Forbidden");
        body.put("code", code);
        body.put("message", message);
        body.put("path", path);
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
