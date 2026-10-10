package br.com.conectatea.anotacao.api;

import br.com.conectatea.anotacao.application.AnotacaoService;
import br.com.conectatea.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/anotacoes")
@Tag(name = "Anotações Globais")
public class GlobalAnotacaoController {
    private final AnotacaoService service;

    public GlobalAnotacaoController(AnotacaoService service) {
        this.service = service;
    }

    @GetMapping("/arquivo-proprio")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Operation(summary = "Arquivo próprio de anotações", description = "Retorna todas as anotações do profissional.")
    public List<AnotacaoDtos.ArquivoResponse> arquivo(Authentication authentication) {
        var principal = (AuthenticatedUser) authentication.getPrincipal();
        return service.arquivoProprio(principal).stream()
                .map(AnotacaoDtos.ArquivoResponse::from)
                .toList();
    }
}
