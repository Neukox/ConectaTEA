package br.com.conectatea.profissional.infrastructure;

import br.com.conectatea.profissional.application.ProfileImageService;
import br.com.conectatea.profissional.application.ProfileImageUrlResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Component
public class HttpProfileImageUrlResolver implements ProfileImageUrlResolver {
    private final String publicApiBaseUrl;
    private final String contextPath;

    public HttpProfileImageUrlResolver(
            @Value("${app.profile-images.public-base-url:}") String publicApiBaseUrl,
            @Value("${server.servlet.context-path:/api}") String contextPath) {
        this.publicApiBaseUrl = publicApiBaseUrl == null
                ? "" : publicApiBaseUrl.replaceAll("/$", "");
        this.contextPath = contextPath;
    }

    @Override
    public String resolve(String reference) {
        if (reference == null) return null;
        if (!reference.startsWith(ProfileImageService.REFERENCE_PREFIX)) return reference;

        var key = reference.substring(ProfileImageService.REFERENCE_PREFIX.length());
        if (!publicApiBaseUrl.isBlank()) {
            return publicApiBaseUrl + "/profissionais/fotos/" + key;
        }
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replacePath(contextPath)
                .path("/profissionais/fotos/")
                .path(key)
                .replaceQuery(null)
                .toUriString();
    }
}
