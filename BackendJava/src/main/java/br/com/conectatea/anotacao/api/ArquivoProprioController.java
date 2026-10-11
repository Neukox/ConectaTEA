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
@RequestMapping("/anotacoes/arquivo-proprio")
@Tag(name = "Anotações")
public class ArquivoProprioController {

    private final AnotacaoService service;

    public ArquivoProprioController(AnotacaoService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Operation(summary = "Consultar arquivo próprio", description = "Retorna notas do autor (incluindo crianças desvinculadas) sem dados de terceiros ou progresso.")
    public List<AnotacaoDtos.ArquivoResponse> arquivoProprio(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        return service.arquivoProprio(user).stream()
                .map(AnotacaoDtos.ArquivoResponse::from)
                .toList();
    }
}
