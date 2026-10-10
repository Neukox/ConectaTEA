package br.com.conectatea.profissional.api;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.application.ProfileImageService;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/profissionais")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Profissionais")
public class ProfissionalController {
    private final ProfissionalRepository professionals;
    private final UsuarioRepository users;
    private final ProfileImageService profileImages;
    private final String publicApiBaseUrl;
    private final String contextPath;

    public ProfissionalController(
            ProfissionalRepository professionals,
            UsuarioRepository users,
            ProfileImageService profileImages,
            @Value("${app.profile-images.public-base-url:}") String publicApiBaseUrl,
            @Value("${server.servlet.context-path:/api}") String contextPath) {
        this.professionals = professionals;
        this.users = users;
        this.profileImages = profileImages;
        this.publicApiBaseUrl = publicApiBaseUrl == null ? "" : publicApiBaseUrl.replaceAll("/$", "");
        this.contextPath = contextPath;
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
                professional.getFotoPerfilUrl());
        return response(professional);
    }

    @PostMapping(value = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ProfessionalResponse uploadPhoto(Authentication authentication,
            @RequestPart("file") MultipartFile file) {
        var principal = (AuthenticatedUser) authentication.getPrincipal();
        return response(profileImages.replace(principal.id(), file));
    }

    @DeleteMapping("/me/foto")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ResponseEntity<Void> removePhoto(Authentication authentication) {
        var principal = (AuthenticatedUser) authentication.getPrincipal();
        profileImages.remove(principal.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fotos/{key}")
    public ResponseEntity<byte[]> photo(@PathVariable String key) {
        var image = profileImages.load(key);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(image.contentType()))
                .cacheControl(org.springframework.http.CacheControl.maxAge(java.time.Duration.ofDays(30)).cachePrivate().immutable())
                .body(image.bytes());
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
                .map(user -> ProfessionalResponse.from(professional, user, photoUrl(professional)));
    }

    private String photoUrl(Profissional professional) {
        var reference = professional.getFotoPerfilUrl();
        if (reference == null) return null;
        if (!reference.startsWith(ProfileImageService.REFERENCE_PREFIX)) return reference;
        var key = reference.substring(ProfileImageService.REFERENCE_PREFIX.length());
        if (!publicApiBaseUrl.isBlank()) return publicApiBaseUrl + "/profissionais/fotos/" + key;
        return ServletUriComponentsBuilder.fromCurrentRequestUri().replacePath(contextPath)
                .path("/profissionais/fotos/").path(key).replaceQuery(null).toUriString();
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    public record UpdateProfessionalRequest(
            String especialidade,
            String registroProfissional,
            String titulo,
            String formacaoAcademica,
            String sobre) {
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
        static ProfessionalResponse from(Profissional professional, Usuario user, String photoUrl) {
            return new ProfessionalResponse(
                    professional.getId(),
                    professional.getUsuarioId(),
                    user.getNome(),
                    professional.getEspecialidade(),
                    professional.getRegistroProfissional(),
                    professional.getTitulo(),
                    professional.getFormacaoAcademica(),
                    professional.getSobre(),
                    photoUrl,
                    professional.getCodigoIdentificacao());
        }
    }
}
