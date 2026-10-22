package br.com.conectatea.profissional.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

class HttpProfileImageUrlResolverTest {
    @AfterEach
    void clearRequest() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void usesConfiguredPublicApiUrlWithoutExposingInternalPrefix() {
        var resolver = new HttpProfileImageUrlResolver("https://api.example.test/api/", "/api");

        assertThat(resolver.resolve("profile-image:photo.png"))
                .isEqualTo("https://api.example.test/api/profissionais/fotos/photo.png");
    }

    @Test
    void fallsBackToObservedRequestOriginAndConfiguredContextPath() {
        var request = new MockHttpServletRequest("GET", "/api/criancas/42/circulo/membros");
        request.setScheme("https");
        request.setServerName("care.example.test");
        request.setServerPort(443);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        var resolver = new HttpProfileImageUrlResolver("", "/api");

        assertThat(resolver.resolve("profile-image:photo.jpg"))
                .isEqualTo("https://care.example.test/api/profissionais/fotos/photo.jpg");
    }

    @Test
    void preservesNullAndLegacyPresentationUrl() {
        var resolver = new HttpProfileImageUrlResolver("https://api.example.test/api", "/api");

        assertThat(resolver.resolve(null)).isNull();
        assertThat(resolver.resolve("https://legacy.example.test/avatar.jpg"))
                .isEqualTo("https://legacy.example.test/avatar.jpg");
    }
}
