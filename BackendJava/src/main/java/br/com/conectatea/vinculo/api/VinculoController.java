package br.com.conectatea.vinculo.api;
import br.com.conectatea.crianca.api.CriancaController; import br.com.conectatea.crianca.infrastructure.CriancaRepository; import br.com.conectatea.security.AuthenticatedUser; import br.com.conectatea.vinculo.application.VinculoService; import jakarta.servlet.http.HttpServletRequest; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.util.List; import org.springframework.http.*; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
@io.swagger.v3.oas.annotations.tags.Tag(name="Vínculos")
@RestController @RequestMapping("/vinculos") public class VinculoController { private final VinculoService service; private final CriancaRepository children; public VinculoController(VinculoService s,CriancaRepository c){service=s;children=c;}
 @GetMapping("/tokens/{codigo}/preview") public VinculoService.Preview preview(@PathVariable String codigo){return service.preview(codigo);}
 @PostMapping("/confirmar") @PreAuthorize("hasRole('RESPONSAVEL')") public VinculoService.Preview confirm(Authentication a,@Valid @RequestBody ConfirmRequest b,HttpServletRequest r){return service.confirm(b.codigo(),b.consentimentoAceito(),(AuthenticatedUser)a.getPrincipal(),r.getRemoteAddr(),r.getHeader("User-Agent"));}
 @GetMapping("/me") @PreAuthorize("hasRole('RESPONSAVEL')") public List<CriancaController.ChildResponse> mine(Authentication a){return children.findLinkedToGuardian(((AuthenticatedUser)a.getPrincipal()).id()).stream().map(CriancaController.ChildResponse::from).toList();}
 @DeleteMapping("/criancas/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('RESPONSAVEL')") public void unlink(Authentication a,@PathVariable Long id){service.unlink(id,(AuthenticatedUser)a.getPrincipal());}
 public record ConfirmRequest(@NotBlank String codigo,@AssertTrue boolean consentimentoAceito){}
}
