package br.com.conectatea.auth.api;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.config.AppProperties;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.JwtAuthenticationFilter;
import br.com.conectatea.security.JwtService;
import br.com.conectatea.security.SecurityConfig;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({AuthController.class, CsrfController.class})
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        ApiExceptionHandler.class,
        AuthControllerWebMvcTest.PropertiesConfiguration.class
})
class AuthControllerWebMvcTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UsuarioRepository usuarios;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void protectedEndpointWithoutAuthenticationReturnsStandard401() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.path").value("/auth/me"));
    }

    @Test
    void invalidLoginDtoReturns400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"email-invalido","password":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fields.email").exists())
                .andExpect(jsonPath("$.fields.password").exists());
    }

    @Test
    void loginCreatesHttpOnlyJwtCookie() throws Exception {
        var usuario = activeUser();
        when(usuarios.findByEmailIgnoreCase("responsavel@example.com"))
                .thenReturn(Optional.of(usuario));
        when(jwtService.issue(usuario)).thenReturn("signed-token");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"responsavel@example.com","password":"senha-segura"}
                                """))
                .andExpect(status().isOk())
                .andExpect(cookie().httpOnly("jwt", true))
                .andExpect(cookie().value("jwt", "signed-token"))
                .andExpect(jsonPath("$.user.email").value("responsavel@example.com"));
    }

    @Test
    void protectedPostWithoutCsrfIsRejected() throws Exception {
        mockMvc.perform(post("/auth/logout")
                        .with(authentication(authenticatedUser())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void protectedPostWithCsrfSucceeds() throws Exception {
        var csrfBootstrap = mockMvc.perform(get("/auth/csrf")
                        .with(authentication(authenticatedUser())))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andReturn();

        var csrfCookie = csrfBootstrap.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(csrfCookie);

        mockMvc.perform(post("/auth/logout")
                        .with(authentication(authenticatedUser()))
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfCookie.getValue()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logout realizado"));
    }

    private UsernamePasswordAuthenticationToken authenticatedUser() {
        var principal = new AuthenticatedUser(
                42L, "responsavel@example.com", TipoUsuario.RESPONSAVEL);
        return UsernamePasswordAuthenticationToken.authenticated(
                principal, null, java.util.List.of());
    }

    private Usuario activeUser() {
        var usuario = new Usuario(
                "Responsável",
                "responsavel@example.com",
                passwordEncoder.encode("senha-segura"),
                null,
                null,
                TipoUsuario.RESPONSAVEL);
        ReflectionTestUtils.setField(usuario, "id", 42L);
        return usuario;
    }

    static class PropertiesConfiguration {
        @Bean
        AppProperties appProperties() {
            return new AppProperties(
                    new AppProperties.Jwt(
                            "test-only-secret-test-only-secret-123456", Duration.ofHours(1)),
                    new AppProperties.Cors("http://localhost:5173"),
                    new AppProperties.Cookie(false, "Lax"));
        }
    }
}
