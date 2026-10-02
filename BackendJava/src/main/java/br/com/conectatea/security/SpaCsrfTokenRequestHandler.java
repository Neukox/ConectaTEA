package br.com.conectatea.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.function.Supplier;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

/**
 * Handler para SPA com cookie CSRF: mantém proteção BREACH ao renderizar o token
 * e aceita o valor bruto do cookie quando o navegador o devolve no header.
 */
final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {

    private final CsrfTokenRequestHandler plain = new CsrfTokenRequestAttributeHandler();
    private final CsrfTokenRequestHandler xor = new XorCsrfTokenRequestAttributeHandler();

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            Supplier<CsrfToken> deferredCsrfToken) {
        xor.handle(request, response, deferredCsrfToken);
        deferredCsrfToken.get();
    }

    @Override
    public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        var headerValue = request.getHeader(csrfToken.getHeaderName());
        var delegate = StringUtils.hasText(headerValue) ? plain : xor;
        return delegate.resolveCsrfTokenValue(request, csrfToken);
    }
}
