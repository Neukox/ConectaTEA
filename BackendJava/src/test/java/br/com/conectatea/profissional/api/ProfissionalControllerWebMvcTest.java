package br.com.conectatea.profissional.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.application.ProfileImageService;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ProfissionalControllerWebMvcTest {
    private final ProfissionalRepository professionals =
            org.mockito.Mockito.mock(ProfissionalRepository.class);
    private final UsuarioRepository users = org.mockito.Mockito.mock(UsuarioRepository.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ProfissionalController(professionals, users,
                        org.mockito.Mockito.mock(ProfileImageService.class), "", "/api"))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void listUsesCamelCaseAndFiltersBySearch() throws Exception {
        var professional = professional();
        when(professionals.findAll()).thenReturn(List.of(professional));
        when(users.findById(10L)).thenReturn(Optional.of(user(true)));

        mockMvc.perform(get("/profissionais").param("search", "fono"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].usuarioId").value(10))
                .andExpect(jsonPath("$[0].name").value("Ana Profissional"))
                .andExpect(jsonPath("$[0].codigoIdentificacao").value("PROF000010"));
    }

    @Test
    void inactiveProfessionalIsNotListed() throws Exception {
        var professional = professional();
        when(professionals.findAll()).thenReturn(List.of(professional));
        when(users.findById(10L)).thenReturn(Optional.of(user(false)));

        mockMvc.perform(get("/profissionais"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void missingProfessionalReturns404() throws Exception {
        when(professionals.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/profissionais/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    private Profissional professional() {
        var professional = new Profissional(10L, "PROF000010");
        ReflectionTestUtils.setField(professional, "id", 20L);
        professional.update("Fonoaudiologia", "CRFa 123", "Fonoaudióloga", null, null, null);
        return professional;
    }

    private Usuario user(boolean active) {
        var user = new Usuario(
                "Ana Profissional", "ana@example.com", "hash", null, null,
                TipoUsuario.PROFISSIONAL);
        ReflectionTestUtils.setField(user, "id", 10L);
        if (!active) {
            user.desativar();
        }
        return user;
    }
}
