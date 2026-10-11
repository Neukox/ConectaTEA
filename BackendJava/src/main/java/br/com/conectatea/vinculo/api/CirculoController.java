package br.com.conectatea.vinculo.api;

import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.vinculo.application.CirculoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/criancas/{criancaId}/circulo")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Círculo de Cuidado")
public class CirculoController {
    private final CirculoService service;
    public CirculoController(CirculoService service) { this.service = service; }

    @GetMapping("/membros")
    public CirculoService.CircleResponse members(Authentication authentication,
                                                  @PathVariable Long criancaId) {
        return service.members(principal(authentication), criancaId);
    }

    @GetMapping("/solicitacoes")
    public java.util.List<CirculoService.RequestResponse> pendingRequests(
            Authentication authentication, @PathVariable Long criancaId) {
        return service.pendingRequests(principal(authentication), criancaId);
    }

    @PatchMapping("/gestao")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void transfer(Authentication authentication, @PathVariable Long criancaId,
                         @Valid @RequestBody TransferRequest request) {
        service.transferManagement(principal(authentication), criancaId, request.responsavelUsuarioId());
    }

    @DeleteMapping("/membros/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(Authentication authentication, @PathVariable Long criancaId) {
        service.leave(principal(authentication), criancaId);
    }

    @DeleteMapping("/membros/{vinculoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(Authentication authentication, @PathVariable Long criancaId,
                       @PathVariable Long vinculoId, @RequestParam String tipo) {
        service.removeMember(principal(authentication), criancaId, vinculoId, tipo);
    }

    private AuthenticatedUser principal(Authentication authentication) {
        return (AuthenticatedUser) authentication.getPrincipal();
    }

    public record TransferRequest(@NotNull Long responsavelUsuarioId) {}
}
