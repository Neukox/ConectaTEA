package br.com.conectatea.usuario.api;

import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/users")
public class UsuarioController {
 private final UsuarioRepository users; private final PasswordEncoder encoder; private final ProfissionalRepository professionals;
 public UsuarioController(UsuarioRepository users,PasswordEncoder encoder,ProfissionalRepository professionals){this.users=users;this.encoder=encoder;this.professionals=professionals;}
 @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) @Transactional public Response register(@Valid @RequestBody Register r){if(users.existsByEmailIgnoreCase(r.email()))throw new DataIntegrityViolationException("Email já cadastrado");var u=users.save(new Usuario(r.name(),r.email(),encoder.encode(r.password()),r.telefone(),r.endereco(),r.tipo()));if(r.tipo()==TipoUsuario.PROFISSIONAL)professionals.save(new Profissional(u.getId(),"PROF"+String.format("%06d",u.getId())));return Response.from(u);}
 @GetMapping("/me") public Response me(Authentication a){return Response.from(current(a));}
 @PutMapping("/me") @Transactional public Response update(Authentication a,@Valid @RequestBody Update r){var u=current(a);u.atualizar(r.name(),r.telefone(),r.endereco());return Response.from(u);}
 @DeleteMapping("/me") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional public void deactivate(Authentication a){current(a).desativar();}
 private Usuario current(Authentication a){return users.findById(((AuthenticatedUser)a.getPrincipal()).id()).orElseThrow();}
 public record Register(@NotBlank @Size(max=150) String name,@NotBlank @Email String email,@NotBlank @Size(min=8,max=72) String password,String telefone,String endereco,@NotNull TipoUsuario tipo){}
 public record Update(@NotBlank @Size(max=150) String name,String telefone,String endereco){}
 public record Response(Long id,String name,String email,String telefone,String endereco,TipoUsuario tipo){static Response from(Usuario u){return new Response(u.getId(),u.getNome(),u.getEmail(),u.getTelefone(),u.getEndereco(),u.getTipo());}}
}
