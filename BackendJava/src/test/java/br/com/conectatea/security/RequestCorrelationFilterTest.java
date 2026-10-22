package br.com.conectatea.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestCorrelationFilterTest {

    private final RequestCorrelationFilter filter = new RequestCorrelationFilter();
    private final FilterChain chain = mock(FilterChain.class);

    @Test
    void propagatesIncomingRequestId() throws Exception {
        var request = new MockHttpServletRequest();
        request.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, "req-123");
        var response = new MockHttpServletResponse();

        var observedDuringChain = new String[1];
        FilterChain observing = (req, res) -> {
            observedDuringChain[0] = MDC.get(RequestCorrelationFilter.MDC_KEY);
            chain.doFilter(req, res);
        };

        filter.doFilter(request, response, observing);

        assertThat(request.getAttribute(RequestCorrelationFilter.REQUEST_ATTRIBUTE))
                .isEqualTo("req-123");
        assertThat(response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER))
                .isEqualTo("req-123");
        assertThat(observedDuringChain[0]).isEqualTo("req-123");
        assertThat(MDC.get(RequestCorrelationFilter.MDC_KEY)).isNull();
    }

    @Test
    void replacesUnsafeIncomingRequestId() throws Exception {
        var request = new MockHttpServletRequest();
        request.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, "forged id with spaces");
        var response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        var requestId = (String) request.getAttribute(RequestCorrelationFilter.REQUEST_ATTRIBUTE);
        assertThat(requestId).isNotEqualTo("forged id with spaces");
        assertThat(requestId).matches("[A-Za-z0-9._-]{1,128}");
        assertThat(response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER))
                .isEqualTo(requestId);
        assertThat(MDC.get(RequestCorrelationFilter.MDC_KEY)).isNull();
    }

    @Test
    void generatesRequestIdWhenAbsent() throws Exception {
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        var requestId = (String) request.getAttribute(RequestCorrelationFilter.REQUEST_ATTRIBUTE);
        assertThat(requestId).isNotBlank();
        assertThat(response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER))
                .isEqualTo(requestId);
        assertThat(MDC.get(RequestCorrelationFilter.MDC_KEY)).isNull();
    }
}
