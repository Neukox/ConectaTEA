package br.com.conectatea.passwordreset.api;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.config.AppProperties;
import br.com.conectatea.passwordreset.application.PasswordResetService;
import br.com.conectatea.security.JwtAuthenticationFilter;
import br.com.conectatea.security.JwtService;
import br.com.conectatea.security.SecurityConfig;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PasswordResetController.class)
@Import({SecurityConfig.class,JwtAuthenticationFilter.class,ApiExceptionHandler.class,PasswordResetControllerWebMvcTest.PropertiesConfiguration.class})
class PasswordResetControllerWebMvcTest {
 @Autowired MockMvc mvc; @MockitoBean PasswordResetService service; @MockitoBean JwtService jwtService; @MockitoBean UsuarioRepository users;
 @Test void forgotIsPublicWithoutCsrfAndReturnsNeutralMessage()throws Exception{mvc.perform(post("/auth/password/forgot").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"user@example.com\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.message").value(PasswordResetController.NEUTRAL_MESSAGE));verify(service).requestPasswordReset("user@example.com");}
 @Test void resetIsPublicWithoutCsrf()throws Exception{mvc.perform(post("/auth/password/reset").contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"raw-token\",\"newPassword\":\"NovaSenha123\"}")).andExpect(status().isOk());verify(service).resetPassword("raw-token","NovaSenha123");}
 @Test void resetRejectsPasswordOutsidePolicy()throws Exception{mvc.perform(post("/auth/password/reset").contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"raw-token\",\"newPassword\":\"curta\"}")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));}
 @Test void forgotIsRateLimitedByIp()throws Exception{for(var i=0;i<5;i++)mvc.perform(post("/auth/password/forgot").with(request->{request.setRemoteAddr("198.51.100.77");return request;}).contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"user@example.com\"}")).andExpect(status().isOk());mvc.perform(post("/auth/password/forgot").with(request->{request.setRemoteAddr("198.51.100.77");return request;}).contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"user@example.com\"}")).andExpect(status().isTooManyRequests()).andExpect(jsonPath("$.code").value("RATE_LIMITED"));}
 static class PropertiesConfiguration{@Bean AppProperties appProperties(){return new AppProperties(new AppProperties.Jwt("test-only-secret-test-only-secret-123456",Duration.ofHours(1)),new AppProperties.Cors("http://localhost:5173"),new AppProperties.Cookie(false,"Lax"));}}
}
