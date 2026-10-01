package br.com.conectatea.usuario.api;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UsuarioController {
    private final UsuarioRepository users;
    private final PasswordEncoder encoder;
    private final ProfissionalRepository professionals;

    public UsuarioController(
            UsuarioRepository users,
            PasswordEncoder encoder,
            ProfissionalRepository professionals) {
        this.users = users;
        this.encoder = encoder;
        this.professionals = professionals;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new DataIntegrityViolationException("Email já cadastrado");
        }
        var user = users.save(new Usuario(
                request.name(),
                request.email(),
                encoder.encode(request.password()),
                request.telefone(),
                request.endereco(),
                request.tipo()));
        if (request.tipo() == TipoUsuario.PROFISSIONAL) {
            professionals.save(new Profissional(
                    user.getId(), "PROF" + String.format("%06d", user.getId())));
        }
        return new RegisterResponse("Usuário cadastrado", UserResponse.from(user));
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from(current(authentication));
    }

    @PutMapping("/me")
    @Transactional
    public UserResponse update(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request) {
        var user = current(authentication);
        user.atualizar(request.name(), request.telefone(), request.endereco());
        return UserResponse.from(user);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deactivate(Authentication authentication) {
        current(authentication).desativar();
    }

    private Usuario current(Authentication authentication) {
        var principal = (AuthenticatedUser) authentication.getPrincipal();
        return users.findById(principal.id()).orElseThrow();
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 150) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            String telefone,
            String endereco,
            @NotNull TipoUsuario tipo) {
    }

    public record UpdateUserRequest(
            @NotBlank @Size(max = 150) String name,
            String telefone,
            String endereco) {
    }

    public record RegisterResponse(String message, UserResponse user) {
    }

    public record UserResponse(
            Long id,
            String name,
            String email,
            String telefone,
            String endereco,
            TipoUsuario tipo) {
        static UserResponse from(Usuario user) {
            return new UserResponse(
                    user.getId(),
                    user.getNome(),
                    user.getEmail(),
                    user.getTelefone(),
                    user.getEndereco(),
                    user.getTipo());
        }
    }
}
