package br.com.conectatea.vinculo.api;
import br.com.conectatea.security.AuthenticatedUser;import br.com.conectatea.vinculo.application.ConviteNominalService;import br.com.conectatea.vinculo.domain.PapelCirculo;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.util.List;import org.springframework.http.*;import org.springframework.security.core.Authentication;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/vinculos/convites") @io.swagger.v3.oas.annotations.tags.Tag(name="Vínculos")
public class ConviteNominalController{private final ConviteNominalService service;public ConviteNominalController(ConviteNominalService service){this.service=service;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public ConviteNominalService.IssuedInvite issue(Authentication a,@Valid @RequestBody IssueRequest r){return service.issue(user(a),r.criancaId(),r.destinatarioEmail(),r.papel());}
 @PostMapping("/aceitar") public ConviteNominalService.InviteView accept(Authentication a,@Valid @RequestBody AcceptRequest r){return service.accept(user(a),r.token());}
 @GetMapping("/me") public List<ConviteNominalService.InviteView> mine(Authentication a){return service.mine(user(a));}
 @GetMapping("/criancas/{childId}") public List<ConviteNominalService.InviteView> child(Authentication a,@PathVariable Long childId){return service.listForChild(user(a),childId);}
 @DeleteMapping("/criancas/{childId}/{inviteId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancel(Authentication a,@PathVariable Long childId,@PathVariable Long inviteId){service.cancel(user(a),childId,inviteId);}
 private AuthenticatedUser user(Authentication a){return(AuthenticatedUser)a.getPrincipal();}
 public record IssueRequest(@NotNull Long criancaId,@NotBlank @Email String destinatarioEmail,@NotNull PapelCirculo papel){} public record AcceptRequest(@NotBlank String token){}
}
