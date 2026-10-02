package br.com.conectatea.profissional.api;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/profissionais")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Profissionais")
public class ProfissionalController {
    private final ProfissionalRepository professionals;
    private final UsuarioRepository users;

    public ProfissionalController(
            ProfissionalRepository professionals,
            UsuarioRepository users) {
        this.professionals = professionals;
        this.users = users;
    }

    @GetMapping
    public List<ProfessionalResponse> list(
            @RequestParam(required = false, defaultValue = "") String search) {
        var normalizedSearch = search.trim().toLowerCase();
        return professionals.findAll().stream()
                .map(this::responseIfActive)
                .flatMap(Optional::stream)
                .filter(item -> normalizedSearch.isBlank()
                        || contains(item.name(), normalizedSearch)
                        || contains(item.especialidade(), normalizedSearch)
                        || contains(item.titulo(), normalizedSearch))
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ProfessionalResponse me(Authentication authentication) {
        return response(current(authentication));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public ProfessionalResponse update(
            Authentication authentication,
            @Valid @RequestBody UpdateProfessionalRequest request) {
        var professional = current(authentication);
        professional.update(
                request.especialidade(),
                request.registroProfissional(),
                request.titulo(),
                request.formacaoAcademica(),
                request.sobre(),
                request.fotoPerfilUrl());
        return response(professional);
    }

    @GetMapping("/{id}")
    public ProfessionalResponse get(@PathVariable Long id) {
        return professionals.findById(id)
                .map(this::response)
                .orElseThrow();
    }

    private Profissional current(Authentication authentication) {
        var principal = (AuthenticatedUser) authentication.getPrincipal();
        return professionals.findByUsuarioId(principal.id())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Perfil profissional não encontrado"));
    }

    private ProfessionalResponse response(Profissional professional) {
        return responseIfActive(professional).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Perfil profissional não encontrado"));
    }

    private Optional<ProfessionalResponse> responseIfActive(Profissional professional) {
        return users.findById(professional.getUsuarioId())
                .filter(Usuario::isAtivo)
                .map(user -> ProfessionalResponse.from(professional, user));
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    public record UpdateProfessionalRequest(
            String especialidade,
            String registroProfissional,
            String titulo,
            String formacaoAcademica,
            String sobre,
            String fotoPerfilUrl) {
    }

    public record ProfessionalResponse(
            Long id,
            Long usuarioId,
            String name,
            String especialidade,
            String registroProfissional,
            String titulo,
            String formacaoAcademica,
            String sobre,
            String fotoPerfilUrl,
            String codigoIdentificacao) {
        static ProfessionalResponse from(Profissional professional, Usuario user) {
            return new ProfessionalResponse(
                    professional.getId(),
                    professional.getUsuarioId(),
                    user.getNome(),
                    professional.getEspecialidade(),
                    professional.getRegistroProfissional(),
                    professional.getTitulo(),
                    professional.getFormacaoAcademica(),
                    professional.getSobre(),
                    professional.getFotoPerfilUrl(),
                    professional.getCodigoIdentificacao());
        }
    }
}
