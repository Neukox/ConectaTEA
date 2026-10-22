package br.com.conectatea.shared.api;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.shared.domain.BusinessRuleException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ApiExceptionHandlerTest {
    @Test
    void exposesBusinessRuleAsConflictWithoutHandlingGenericIllegalState() {
        var request = new MockHttpServletRequest("POST", "/metas/1/progresso");

        var response = new ApiExceptionHandler().businessRule(
                new BusinessRuleException("META_PAUSED", "Meta pausada"), request);

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("META_PAUSED");
        assertThat(response.getBody().path()).isEqualTo("/metas/1/progresso");
    }
}
