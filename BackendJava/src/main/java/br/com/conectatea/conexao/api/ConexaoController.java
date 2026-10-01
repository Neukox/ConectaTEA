package br.com.conectatea.conexao.api;

import br.com.conectatea.conexao.domain.ConexaoProfissional;
import br.com.conectatea.conexao.domain.StatusConexao;
import br.com.conectatea.conexao.infrastructure.ConexaoRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
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
@RequestMapping("/conexoes")
@PreAuthorize("hasRole('PROFISSIONAL')")
public class ConexaoController {
    private final ConexaoRepository connections;
    private final ProfissionalRepository professionals;

    public ConexaoController(
            ConexaoRepository connections,
            ProfissionalRepository professionals) {
        this.connections = connections;
        this.professionals = professionals;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ConnectionResponse send(
            Authentication authentication,
            @Valid @RequestBody CreateConnectionRequest request) {
        var me = professional(authentication);
        if (me.equals(request.destinatarioId())) {
            throw new IllegalArgumentException("Autoconexão inválida");
        }
        if (!professionals.existsById(request.destinatarioId())) {
            throw new java.util.NoSuchElementException("Destinatário não encontrado");
        }
        return ConnectionResponse.from(connections.save(
                new ConexaoProfissional(me, request.destinatarioId())));
    }

    @GetMapping
    public List<ConnectionResponse> list(
            Authentication authentication,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) StatusConexao status) {
        var me = professional(authentication);
        return connections.findMine(me).stream()
                .filter(item -> matchesType(item, me, tipo))
                .filter(item -> status == null || item.getStatus() == status)
                .map(ConnectionResponse::from)
                .toList();
    }

    @PutMapping("/{id}/responder")
    @Transactional
    public ConnectionResponse respond(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ReplyConnectionRequest request) {
        if (request.status() == StatusConexao.PENDENTE) {
            throw new IllegalArgumentException("Resposta deve ser ACEITO ou RECUSADO");
        }
        var connection = connections.findById(id).orElseThrow();
        connection.respond(professional(authentication), request.status());
        return ConnectionResponse.from(connection);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(Authentication authentication, @PathVariable Long id) {
        var connection = connections.findById(id).orElseThrow();
        if (!connection.participant(professional(authentication))) {
            throw new AccessDeniedException("Não participa da conexão");
        }
        connections.delete(connection);
    }

    private Long professional(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        return professionals.findByUsuarioId(user.id()).orElseThrow().getId();
    }

    private boolean matchesType(ConexaoProfissional connection, Long me, String type) {
        if (type == null || type.isBlank() || type.equalsIgnoreCase("todas")) {
            return true;
        }
        return switch (type.toLowerCase(Locale.ROOT)) {
            case "enviadas" -> connection.getSolicitanteId().equals(me);
            case "recebidas" -> connection.getDestinatarioId().equals(me);
            default -> throw new IllegalArgumentException("tipo inválido");
        };
    }

    public record CreateConnectionRequest(@NotNull Long destinatarioId) {
    }

    public record ReplyConnectionRequest(@NotNull StatusConexao status) {
    }

    public record ConnectionResponse(
            Long id,
            Long solicitanteId,
            Long destinatarioId,
            StatusConexao status) {
        static ConnectionResponse from(ConexaoProfissional connection) {
            return new ConnectionResponse(
                    connection.getId(), connection.getSolicitanteId(),
                    connection.getDestinatarioId(), connection.getStatus());
        }
    }
}
