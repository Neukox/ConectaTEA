package br.com.conectatea.crianca.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.crianca.domain.ContatoResponsavelPendente;
import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.ContatoResponsavelPendenteRepository;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

class CriancaControllerWebMvcTest {
    private final CriancaRepository children = org.mockito.Mockito.mock(CriancaRepository.class);
    private final ContatoResponsavelPendenteRepository contacts =
            org.mockito.Mockito.mock(ContatoResponsavelPendenteRepository.class);
    private final ProfissionalRepository professionals =
            org.mockito.Mockito.mock(ProfissionalRepository.class);
    private final VinculoProfissionalRepository links =
            org.mockito.Mockito.mock(VinculoProfissionalRepository.class);
    private final AuthorizationService authorization =
            org.mockito.Mockito.mock(AuthorizationService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        var objectMapper = new com.fasterxml.jackson.databind.ObjectMapper()
                .findAndRegisterModules()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mockMvc = MockMvcBuilders.standaloneSetup(new CriancaController(
                        children, contacts, professionals, links, authorization))
                .setControllerAdvice(new ApiExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void createPersistsPendingGuardianAndReturnsEnvelope() throws Exception {
        var professional = new Profissional(10L, "PROF000010");
        ReflectionTestUtils.setField(professional, "id", 20L);
        when(professionals.findByUsuarioId(10L)).thenReturn(Optional.of(professional));
        when(children.save(any(Crianca.class))).thenAnswer(invocation -> {
            var child = invocation.getArgument(0, Crianca.class);
            ReflectionTestUtils.setField(child, "id", 30L);
            return child;
        });

        mockMvc.perform(post("/criancas")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome":"Lia",
                                  "dataNascimento":"2018-04-12",
                                  "genero":"Feminino",
                                  "responsavelPendente":{
                                    "nome":"Maria",
                                    "email":"maria@example.com",
                                    "parentesco":"MAE"
                                  }
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Criança cadastrada"))
                .andExpect(jsonPath("$.crianca.id").value(30))
                .andExpect(jsonPath("$.crianca.dataNascimento").value("2018-04-12"));

        verify(contacts).save(any(ContatoResponsavelPendente.class));
    }

    @Test
    void futureBirthDateReturns400() throws Exception {
        mockMvc.perform(post("/criancas")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Lia","dataNascimento":"2099-04-12"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.dataNascimento").exists());
    }

    private UsernamePasswordAuthenticationToken authentication() {
        var principal = new AuthenticatedUser(
                10L, "profissional@example.com", TipoUsuario.PROFISSIONAL);
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of());
    }
}
