package br.com.conectatea.vinculo.api;

import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.vinculo.application.VinculoService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/criancas")
public class TokenCriancaController {
    private final VinculoService links;
    private final AuthorizationService authorization;
    private final ProfissionalRepository professionals;

    public TokenCriancaController(
            VinculoService links,
            AuthorizationService authorization,
            ProfissionalRepository professionals) {
        this.links = links;
        this.authorization = authorization;
        this.professionals = professionals;
    }

    @PostMapping("/{id}/tokens-vinculo")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public VinculoService.GeneratedToken generate(
            Authentication authentication,
            @PathVariable Long id) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        authorization.requireCrianca(user, id);
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        return links.generate(id, professional.getId(), user.id());
    }

    @DeleteMapping("/{childId}/tokens-vinculo/{tokenId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public void cancel(
            Authentication authentication,
            @PathVariable Long childId,
            @PathVariable Long tokenId) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        authorization.requireCrianca(user, childId);
        var professional = professionals.findByUsuarioId(user.id()).orElseThrow();
        links.cancel(tokenId, childId, professional.getId(), user.id());
    }
}
