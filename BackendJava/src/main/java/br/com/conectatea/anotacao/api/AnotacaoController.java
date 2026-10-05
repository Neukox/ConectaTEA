package br.com.conectatea.anotacao.api;

import br.com.conectatea.anotacao.application.AnotacaoService;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import br.com.conectatea.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/criancas/{criancaId}/anotacoes")
@Tag(name = "Anotações")
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Sessão não autenticada"),
        @ApiResponse(responseCode = "403", description = "Papel, autoria ou vínculo insuficiente"),
        @ApiResponse(responseCode = "404", description = "Criança ou anotação não encontrada")
})
public class AnotacaoController {
    private final AnotacaoService service;

    public AnotacaoController(AnotacaoService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Operation(summary = "Criar anotação", description = "Somente PROFISSIONAL com vínculo ativo. O autor é obtido da sessão; autorId não é aceito no request.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Anotação criada"),
            @ApiResponse(responseCode = "400", description = "Conteúdo ou visibilidade inválidos")
    })
    public AnotacaoDtos.Response criar(
            Authentication authentication,
            @PathVariable Long criancaId,
            @Valid @RequestBody AnotacaoDtos.CreateRequest request) {
        return AnotacaoDtos.Response.from(service.criar(
                principal(authentication), criancaId, request.conteudo(), request.visibilidade()));
    }

    @GetMapping
    @Operation(summary = "Listar anotações autorizadas da criança", description = "PROFISSIONAL recebe próprias privadas e compartilhadas autorizadas; RESPONSAVEL recebe somente compartilhadas. Filtros nunca ampliam o escopo.")
    @ApiResponse(responseCode = "200", description = "Lista já filtrada por autorização")
    public List<AnotacaoDtos.Response> listar(
            Authentication authentication,
            @PathVariable Long criancaId,
            @RequestParam(required = false) VisibilidadeAnotacao visibilidade,
            @RequestParam(required = false) Long profissionalId,
            @RequestParam(required = false, defaultValue = "") String busca,
            @Parameter(description = "RECENTES ou ANTIGAS", example = "RECENTES")
            @RequestParam(required = false, defaultValue = "RECENTES") String ordenacao) {
        return service.listar(principal(authentication), criancaId, visibilidade,
                        profissionalId, busca, ordenacao)
                .stream().map(AnotacaoDtos.Response::from).toList();
    }

    @GetMapping("/{anotacaoId}")
    @Operation(summary = "Consultar anotação", description = "Valida simultaneamente anotacaoId, criancaId da URL, vínculo, papel, visibilidade e autoria para prevenir IDOR.")
    public AnotacaoDtos.Response buscar(
            Authentication authentication,
            @PathVariable Long criancaId,
            @PathVariable Long anotacaoId) {
        return AnotacaoDtos.Response.from(
                service.buscar(principal(authentication), criancaId, anotacaoId));
    }

    @PutMapping("/{anotacaoId}")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Operation(summary = "Atualizar anotação própria", description = "Somente o profissional autor pode alterar conteúdo e visibilidade, inclusive entre PRIVADA e COMPARTILHADA.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Anotação atualizada"),
            @ApiResponse(responseCode = "400", description = "Conteúdo ou visibilidade inválidos")
    })
    public AnotacaoDtos.Response atualizar(
            Authentication authentication,
            @PathVariable Long criancaId,
            @PathVariable Long anotacaoId,
            @Valid @RequestBody AnotacaoDtos.UpdateRequest request) {
        return AnotacaoDtos.Response.from(service.atualizar(
                principal(authentication), criancaId, anotacaoId,
                request.conteudo(), request.visibilidade()));
    }

    @DeleteMapping("/{anotacaoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Operation(summary = "Excluir anotação própria", description = "Exclusão física permitida somente ao profissional autor, após validar vínculo e IDs da URL.")
    public void excluir(
            Authentication authentication,
            @PathVariable Long criancaId,
            @PathVariable Long anotacaoId) {
        service.excluir(principal(authentication), criancaId, anotacaoId);
    }

    private AuthenticatedUser principal(Authentication authentication) {
        return (AuthenticatedUser) authentication.getPrincipal();
    }
}
