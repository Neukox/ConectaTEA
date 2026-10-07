package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@AutoConfigureMockMvc
class AnotacaoOpenApiIntegrationTest extends PostgresIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void openApiPublicaTagDtosEEndpointsReais() throws Exception {
        var document = mockMvc.perform(get("/v3/api-docs"))
                .andReturn().getResponse().getContentAsString();

        assertThat(document)
                .contains("Anotações")
                .contains("/criancas/{criancaId}/anotacoes")
                .contains("CriarAnotacaoRequest")
                .contains("AnotacaoResponse")
                .contains("PRIVADA")
                .contains("COMPARTILHADA");
    }
}
