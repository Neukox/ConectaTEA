package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class NotificacaoOpenApiIntegrationTest extends PostgresIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void publicaTagTiposEndpointsEOwnership() throws Exception {
        var document = mockMvc.perform(get("/v3/api-docs"))
                .andReturn().getResponse().getContentAsString();
        assertThat(document)
                .contains("Notificações")
                .contains("/notificacoes")
                .contains("/notificacoes/nao-lidas/count")
                .contains("/notificacoes/{id}/lida")
                .contains("/notificacoes/lidas")
                .contains("ANOTACAO_TORNADA_PRIVADA")
                .contains("IDOR")
                .contains("não concede acesso");
    }
}
