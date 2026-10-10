package br.com.conectatea.usuario.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.application.CirculoService;
import br.com.conectatea.emailverification.application.EmailVerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class UsuarioControllerWebMvcTest {
    private final UsuarioRepository users = org.mockito.Mockito.mock(UsuarioRepository.class);
    private final PasswordEncoder passwords = org.mockito.Mockito.mock(PasswordEncoder.class);
    private final ProfissionalRepository professionals =
            org.mockito.Mockito.mock(ProfissionalRepository.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        var controller = new UsuarioController(users, passwords, professionals,
                org.mockito.Mockito.mock(CirculoService.class),
                org.mockito.Mockito.mock(EmailVerificationService.class));
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void registerReturnsCanonicalEnvelope() throws Exception {
        when(users.existsByEmailIgnoreCase("familia@example.com")).thenReturn(false);
        when(passwords.encode("senha-segura")).thenReturn("hash");
        when(users.save(any(Usuario.class))).thenAnswer(invocation -> {
            var user = invocation.getArgument(0, Usuario.class);
            ReflectionTestUtils.setField(user, "id", 7L);
            return user;
        });

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Família",
                                  "email":"familia@example.com",
                                  "password":"senha-segura",
                                  "tipo":"RESPONSAVEL"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Usuário cadastrado"))
                .andExpect(jsonPath("$.user.id").value(7))
                .andExpect(jsonPath("$.user.tipo").value("RESPONSAVEL"));
    }

    @Test
    void duplicateEmailReturns409() throws Exception {
        when(users.existsByEmailIgnoreCase("familia@example.com")).thenReturn(true);

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Família",
                                  "email":"familia@example.com",
                                  "password":"senha-segura",
                                  "tipo":"RESPONSAVEL"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DATA_CONFLICT"));
    }

    @Test
    void shortPasswordReturns400() throws Exception {
        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Família",
                                  "email":"familia@example.com",
                                  "password":"1234567",
                                  "tipo":"RESPONSAVEL"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.password").exists());
    }
}
