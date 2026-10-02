package br.com.conectatea.localatendimento.api;

import br.com.conectatea.localatendimento.application.LocalAtendimentoService;
import br.com.conectatea.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/profissionais/me/locais-atendimento") @PreAuthorize("hasRole('PROFISSIONAL')")
public class LocalAtendimentoController {
    private final LocalAtendimentoService service;
    public LocalAtendimentoController(LocalAtendimentoService service) { this.service = service; }
    @GetMapping public List<LocalAtendimentoDtos.Response> list(Authentication auth) { return service.list(userId(auth)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public LocalAtendimentoDtos.Response create(Authentication auth, @Valid @RequestBody LocalAtendimentoDtos.CreateRequest request) { return service.create(userId(auth), request); }
    @PutMapping("/{id}") public LocalAtendimentoDtos.Response update(Authentication auth, @PathVariable Long id, @Valid @RequestBody LocalAtendimentoDtos.UpdateRequest request) { return service.update(userId(auth), id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication auth, @PathVariable Long id) { service.delete(userId(auth), id); }
    private Long userId(Authentication auth) { return ((AuthenticatedUser) auth.getPrincipal()).id(); }
}
