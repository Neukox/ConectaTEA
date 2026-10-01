package br.com.conectatea.auth.api;

import br.com.conectatea.config.AppProperties;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.JwtService;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/auth")
public class AuthController {
    private final UsuarioRepository users; private final PasswordEncoder passwords; private final JwtService jwt; private final AppProperties properties;
    public AuthController(UsuarioRepository users,PasswordEncoder passwords,JwtService jwt,AppProperties properties){this.users=users;this.passwords=passwords;this.jwt=jwt;this.properties=properties;}
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request,HttpServletResponse response){var user=users.findByEmailIgnoreCase(request.email().trim()).filter(u->u.isAtivo()&&passwords.matches(request.password(),u.getPasswordHash())).orElseThrow(()->new BadCredentialsException("Credenciais inválidas"));response.addHeader(HttpHeaders.SET_COOKIE,cookie(jwt.issue(user),properties.jwt().expiration().toSeconds()).toString());return new AuthResponse("Login realizado",UserResponse.from(user));}
    @PostMapping("/logout") public MessageResponse logout(HttpServletResponse response){response.addHeader(HttpHeaders.SET_COOKIE,cookie("",0).toString());return new MessageResponse("Logout realizado");}
    @GetMapping("/me") public AuthResponse me(Authentication auth){var principal=(AuthenticatedUser)auth.getPrincipal();var user=users.findById(principal.id()).map(UserResponse::from).orElseThrow();return new AuthResponse("Usuário autenticado",user);}
    private ResponseCookie cookie(String value,long age){return ResponseCookie.from("jwt",value).httpOnly(true).secure(properties.cookie().secure()).sameSite(properties.cookie().sameSite()).path("/").maxAge(age).build();}
    public record LoginRequest(@NotBlank @Email String email,@NotBlank String password){}
    public record MessageResponse(String message){}
    public record AuthResponse(String message,UserResponse user){}
    public record UserResponse(Long id,String name,String email,String telefone,String endereco,String tipo){static UserResponse from(br.com.conectatea.usuario.domain.Usuario u){return new UserResponse(u.getId(),u.getNome(),u.getEmail(),u.getTelefone(),u.getEndereco(),u.getTipo().name());}}
}
