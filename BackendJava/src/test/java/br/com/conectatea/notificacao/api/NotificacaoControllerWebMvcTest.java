package br.com.conectatea.notificacao.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.notificacao.application.NotificationService;
import br.com.conectatea.notificacao.application.NotificacaoView;
import br.com.conectatea.notificacao.domain.TipoNotificacao;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class NotificacaoControllerWebMvcTest {
    private final NotificationService service = org.mockito.Mockito.mock(NotificationService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(new NotificacaoController(service))
                .setControllerAdvice(new ApiExceptionHandler()).build();
    }

    @Test
    void listaEContaUsandoPrincipalAutenticado() throws Exception {
        when(service.listar(any())).thenReturn(List.of(view(false)));
        when(service.contarNaoLidas(any())).thenReturn(1L);
        mockMvc.perform(get("/notificacoes").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipo").value("ANOTACAO_CRIADA"));
        mockMvc.perform(get("/notificacoes/nao-lidas/count").principal(authentication()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.count").value(1));
    }

    @Test
    void marcaUmaETodasSemAceitarUsuarioId() throws Exception {
        when(service.marcarComoLida(any(), eq(5L))).thenReturn(view(true));
        when(service.marcarTodasComoLidas(any())).thenReturn(2);
        mockMvc.perform(patch("/notificacoes/5/lida").principal(authentication()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lida").value(true));
        mockMvc.perform(patch("/notificacoes/lidas").principal(authentication()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.updated").value(2));
        verify(service).marcarComoLida(any(AuthenticatedUser.class), eq(5L));
    }

    private NotificacaoView view(boolean read) {
        return new NotificacaoView(5L, 10L, 20L, TipoNotificacao.ANOTACAO_CRIADA,
                "Atualização", "Mensagem segura", read,
                read ? Instant.parse("2026-10-07T12:01:00Z") : null,
                Instant.parse("2026-10-07T12:00:00Z"));
    }

    private UsernamePasswordAuthenticationToken authentication() {
        var principal = new AuthenticatedUser(2L, "ana@test.local", TipoUsuario.PROFISSIONAL);
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of());
    }
}
