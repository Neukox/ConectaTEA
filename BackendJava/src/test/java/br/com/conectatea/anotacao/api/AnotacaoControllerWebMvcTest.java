package br.com.conectatea.anotacao.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.anotacao.application.AnotacaoService;
import br.com.conectatea.anotacao.application.AnotacaoView;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.usuario.domain.TipoUsuario;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AnotacaoControllerWebMvcTest {
    private final AnotacaoService service = org.mockito.Mockito.mock(AnotacaoService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper()
                .findAndRegisterModules()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mockMvc = MockMvcBuilders.standaloneSetup(new AnotacaoController(service))
                .setControllerAdvice(new ApiExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(mapper))
                .build();
    }

    @Test
    void criaSemAceitarAutorNoContrato() throws Exception {
        org.mockito.Mockito.when(service.criar(any(), eq(10L), any(), eq(VisibilidadeAnotacao.PRIVADA)))
                .thenReturn(view());

        mockMvc.perform(post("/criancas/10/anotacoes")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"conteudo":"Conteúdo válido para teste", "visibilidade":"PRIVADA"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(30))
                .andExpect(jsonPath("$.isAutor").value(true));
    }

    @Test
    void conteudoVazioRetorna400() throws Exception {
        mockMvc.perform(post("/criancas/10/anotacoes")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"conteudo":" ", "visibilidade":"PRIVADA"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.conteudo").exists());
    }

    @Test
    void conteudoAcimaDoLimiteRetorna400() throws Exception {
        var content = "x".repeat(3001);
        mockMvc.perform(post("/criancas/10/anotacoes")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"conteudo\":\"" + content
                                + "\",\"visibilidade\":\"COMPARTILHADA\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.conteudo").exists());
    }

    @Test
    void consultaEncaminhaCriancaEAnotacaoParaValidacaoIdor() throws Exception {
        org.mockito.Mockito.when(service.buscar(any(), eq(10L), eq(30L))).thenReturn(view());

        mockMvc.perform(get("/criancas/10/anotacoes/30").principal(authentication()))
                .andExpect(status().isOk());

        verify(service).buscar(any(), eq(10L), eq(30L));
    }

    private AnotacaoView view() {
        return new AnotacaoView(
                30L, 10L, "Lia", 20L, "Dra. Autora", "Psicologia",
                "Conteúdo válido para teste", VisibilidadeAnotacao.PRIVADA,
                Instant.parse("2026-10-05T12:00:00Z"),
                Instant.parse("2026-10-05T12:00:00Z"), true);
    }

    private UsernamePasswordAuthenticationToken authentication() {
        var principal = new AuthenticatedUser(1L, "prof@test.local", TipoUsuario.PROFISSIONAL);
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of());
    }
}
