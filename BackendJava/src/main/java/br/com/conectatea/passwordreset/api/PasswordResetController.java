package br.com.conectatea.passwordreset.api;

import br.com.conectatea.passwordreset.application.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/password")
@io.swagger.v3.oas.annotations.tags.Tag(name="Autenticação")
public class PasswordResetController {
    public static final String NEUTRAL_MESSAGE="Se existir uma conta associada a este e-mail, enviaremos instruções para redefinição da senha.";
    private final PasswordResetService service;
    public PasswordResetController(PasswordResetService service){this.service=service;}

    @Operation(summary="Solicitar recuperação de senha",description="Endpoint público e sem CSRF. Sempre retorna resposta neutra para impedir enumeração de contas. A notificação é processada de forma desacoplada após a persistência. Limitado a 5 solicitações por minuto por IP nesta instância.")
    @SecurityRequirements
    @ApiResponses({@ApiResponse(responseCode="200",description="Solicitação recebida, exista ou não uma conta"),@ApiResponse(responseCode="400",description="E-mail inválido",content=@Content),@ApiResponse(responseCode="429",description="Limite local de solicitações excedido",content=@Content)})
    @PostMapping("/forgot")
    public MessageResponse forgot(@Valid @RequestBody ForgotRequest request){service.requestPasswordReset(request.email());return new MessageResponse(NEUTRAL_MESSAGE);}

    @Operation(summary="Redefinir senha",description="Endpoint público e sem CSRF. Consome uma única vez um token com validade configurável (30 minutos por padrão). Tokens inexistentes, expirados, usados ou invalidados produzem o mesmo erro.")
    @SecurityRequirements
    @ApiResponses({@ApiResponse(responseCode="200",description="Senha redefinida"),@ApiResponse(responseCode="400",description="Token inválido/expirado ou senha fora da política",content=@Content)})
    @PostMapping("/reset")
    public MessageResponse reset(@Valid @RequestBody ResetRequest request){service.resetPassword(request.token(),request.newPassword());return new MessageResponse("Senha redefinida com sucesso.");}

    public record ForgotRequest(@NotBlank @Email @Schema(example="usuario@email.com") String email){}
    public record ResetRequest(@NotBlank @Schema(example="token-recebido") String token,@NotBlank @Size(min=8,max=72) @Schema(example="NovaSenhaSegura123",minLength=8,maxLength=72) String newPassword){}
    public record MessageResponse(@Schema(example="Senha redefinida com sucesso.") String message){}
}
