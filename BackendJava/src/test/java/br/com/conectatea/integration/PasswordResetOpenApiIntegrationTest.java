package br.com.conectatea.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class PasswordResetOpenApiIntegrationTest extends PostgresIntegrationTest {
    @Autowired MockMvc mvc;

    @Test void openApiPublishesPublicPasswordResetContracts() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").exists())
                .andExpect(jsonPath("$.paths['/auth/password/forgot'].post").exists())
                .andExpect(jsonPath("$.paths['/auth/password/forgot'].post.security").isArray())
                .andExpect(jsonPath("$.paths['/auth/password/reset'].post").exists())
                .andExpect(jsonPath("$.paths['/auth/password/reset'].post.security").isArray())
                .andExpect(jsonPath("$.components.securitySchemes.cookieAuth").exists());
    }
}
