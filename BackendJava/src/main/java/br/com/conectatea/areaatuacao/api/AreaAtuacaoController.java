package br.com.conectatea.areaatuacao.api;

import br.com.conectatea.areaatuacao.application.AreaAtuacaoService;
import br.com.conectatea.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class AreaAtuacaoController {
    private final AreaAtuacaoService service;
    public AreaAtuacaoController(AreaAtuacaoService service) { this.service = service; }
    @GetMapping("/areas-atuacao") public List<AreaAtuacaoDtos.Response> catalog() { return service.catalog(); }
    @GetMapping("/profissionais/me/areas-atuacao") @PreAuthorize("hasRole('PROFISSIONAL')") public List<AreaAtuacaoDtos.Response> mine(Authentication auth) { return service.mine(userId(auth)); }
    @PostMapping("/profissionais/me/areas-atuacao") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('PROFISSIONAL')") public AreaAtuacaoDtos.Response link(Authentication auth, @Valid @RequestBody AreaAtuacaoDtos.LinkRequest request) { return service.link(userId(auth), request.areaId()); }
    @DeleteMapping("/profissionais/me/areas-atuacao/{areaId}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('PROFISSIONAL')") public void unlink(Authentication auth, @PathVariable Long areaId) { service.unlink(userId(auth), areaId); }
    private Long userId(Authentication auth) { return ((AuthenticatedUser) auth.getPrincipal()).id(); }
}
