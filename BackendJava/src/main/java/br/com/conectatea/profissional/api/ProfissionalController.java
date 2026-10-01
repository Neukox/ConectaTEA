package br.com.conectatea.profissional.api;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/profissionais")
public class ProfissionalController {
 private final ProfissionalRepository repository; public ProfissionalController(ProfissionalRepository r){repository=r;}
 @GetMapping public List<Response> list(){return repository.findAll().stream().map(Response::from).toList();}
 @GetMapping("/me") @PreAuthorize("hasRole('PROFISSIONAL')") public Response me(Authentication a){return Response.from(current(a));}
 @PutMapping("/me") @PreAuthorize("hasRole('PROFISSIONAL')") @Transactional public Response update(Authentication a,@Valid @RequestBody Update x){var p=current(a);p.update(x.especialidade(),x.registroProfissional(),x.titulo(),x.formacaoAcademica(),x.sobre(),x.fotoPerfilUrl());return Response.from(p);}
 private Profissional current(Authentication a){return repository.findByUsuarioId(((AuthenticatedUser)a.getPrincipal()).id()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Perfil profissional não encontrado"));}
 public record Update(String especialidade,String registroProfissional,String titulo,String formacaoAcademica,String sobre,String fotoPerfilUrl){}
 public record Response(Long id,Long usuarioId,String especialidade,String registroProfissional,String titulo,String formacaoAcademica,String sobre,String fotoPerfilUrl,String codigoIdentificacao){static Response from(Profissional p){return new Response(p.getId(),p.getUsuarioId(),p.getEspecialidade(),p.getRegistroProfissional(),p.getTitulo(),p.getFormacaoAcademica(),p.getSobre(),p.getFotoPerfilUrl(),p.getCodigoIdentificacao());}}
}

