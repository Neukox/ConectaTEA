package br.com.conectatea.notificacao.api;

import br.com.conectatea.notificacao.application.NotificationService;
import br.com.conectatea.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notificacoes")
@Tag(name = "Notificações")
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Sessão não autenticada"),
        @ApiResponse(responseCode = "404", description = "Notificação inexistente ou pertencente a outro usuário")
})
public class NotificacaoController {
    private final NotificationService service;

    public NotificacaoController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar notificações", description = "Retorna apenas notificações do usuário autenticado, da mais recente para a mais antiga. A existência de uma notificação não concede acesso à anotação ou à criança.")
    public List<NotificacaoDtos.Response> listar(Authentication authentication) {
        return service.listar(principal(authentication)).stream()
                .map(NotificacaoDtos.Response::from).toList();
    }

    @GetMapping("/nao-lidas/count")
    @Operation(summary = "Contar notificações não lidas", description = "O usuário é sempre derivado da sessão; usuarioId não é aceito.")
    public NotificacaoDtos.CountResponse contarNaoLidas(Authentication authentication) {
        return new NotificacaoDtos.CountResponse(service.contarNaoLidas(principal(authentication)));
    }

    @GetMapping("/sino")
    @Operation(summary = "Listar notificações visíveis no sino", description = "Limpar o sino não altera leitura nem remove o histórico.")
    public List<NotificacaoDtos.Response> listarSino(Authentication authentication) {
        return service.listarSino(principal(authentication)).stream()
                .map(NotificacaoDtos.Response::from).toList();
    }

    @PatchMapping("/sino/limpar")
    @Operation(summary = "Limpar o sino", description = "Oculta itens do sino, preservando histórico e estado de leitura.")
    public NotificacaoDtos.ClearBellResponse limparSino(Authentication authentication) {
        return new NotificacaoDtos.ClearBellResponse(service.limparSino(principal(authentication)));
    }

    @PatchMapping("/{id}/lida")
    @Operation(summary = "Marcar uma notificação como lida", description = "Aplica ownership pelo usuário autenticado. IDs alheios são tratados como inexistentes para prevenir IDOR.")
    public NotificacaoDtos.Response marcarComoLida(Authentication authentication, @PathVariable Long id) {
        return NotificacaoDtos.Response.from(service.marcarComoLida(principal(authentication), id));
    }

    @PatchMapping("/lidas")
    @Operation(summary = "Marcar todas como lidas", description = "Atualiza somente notificações não lidas do usuário autenticado.")
    public NotificacaoDtos.ReadAllResponse marcarTodasComoLidas(Authentication authentication) {
        return new NotificacaoDtos.ReadAllResponse(service.marcarTodasComoLidas(principal(authentication)));
    }

    private AuthenticatedUser principal(Authentication authentication) {
        return (AuthenticatedUser) authentication.getPrincipal();
    }
}
