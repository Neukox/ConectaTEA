package br.com.conectatea.security;

import br.com.conectatea.config.AppProperties;
import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

@Configuration @EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
    @Bean CorsConfigurationSource corsConfigurationSource(AppProperties p){var c=new CorsConfiguration();c.setAllowedOrigins(Arrays.stream(p.cors().origins().split(",")).map(String::trim).toList());c.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));c.setAllowedHeaders(Arrays.asList("Content-Type","X-XSRF-TOKEN"));c.setAllowCredentials(true);var source=new UrlBasedCorsConfigurationSource();source.registerCorsConfiguration("/**",c);return source;}
    @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthenticationFilter jwt)throws Exception{
        var csrf=CookieCsrfTokenRepository.withHttpOnlyFalse();csrf.setCookiePath("/");
        return http.cors(c->{}).csrf(c->c.csrfTokenRepository(csrf).ignoringRequestMatchers("/auth/login","/users/register"))
          .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
          .authorizeHttpRequests(a->a.requestMatchers("/auth/login","/users/register","/docs/**","/v3/api-docs/**","/actuator/health/**").permitAll().requestMatchers(HttpMethod.OPTIONS,"/**").permitAll().anyRequest().authenticated())
          .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).build();
    }
}

