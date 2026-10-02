package br.com.conectatea.redesocial.api;

import br.com.conectatea.redesocial.application.RedeSocialService;
import br.com.conectatea.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/profissionais/me/redes-sociais") @PreAuthorize("hasRole('PROFISSIONAL')")
public class RedeSocialController {
    private final RedeSocialService service;
    public RedeSocialController(RedeSocialService service) { this.service = service; }
    @GetMapping public List<RedeSocialDtos.Response> list(Authentication auth) { return service.list(userId(auth)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public RedeSocialDtos.Response create(Authentication auth, @Valid @RequestBody RedeSocialDtos.CreateRequest request) { return service.create(userId(auth), request); }
    @PutMapping("/{id}") public RedeSocialDtos.Response update(Authentication auth, @PathVariable Long id, @Valid @RequestBody RedeSocialDtos.UpdateRequest request) { return service.update(userId(auth), id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication auth, @PathVariable Long id) { service.delete(userId(auth), id); }
    private Long userId(Authentication auth) { return ((AuthenticatedUser) auth.getPrincipal()).id(); }
}
