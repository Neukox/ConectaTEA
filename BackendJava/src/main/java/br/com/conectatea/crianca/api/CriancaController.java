package br.com.conectatea.crianca.api;

import br.com.conectatea.crianca.domain.ContatoResponsavelPendente;
import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.ContatoResponsavelPendenteRepository;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/criancas")
public class CriancaController {
    private final CriancaRepository children;
    private final ContatoResponsavelPendenteRepository pendingContacts;
    private final ProfissionalRepository professionals;
    private final VinculoProfissionalRepository links;
    private final AuthorizationService authorization;

    public CriancaController(
            CriancaRepository children,
            ContatoResponsavelPendenteRepository pendingContacts,
            ProfissionalRepository professionals,
            VinculoProfissionalRepository links,
            AuthorizationService authorization) {
        this.children = children;
        this.pendingContacts = pendingContacts;
        this.professionals = professionals;
        this.links = links;
        this.authorization = authorization;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public CreateChildResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateChildRequest request) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        var professional = professionals.findByUsuarioId(user.id())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Perfil profissional não encontrado"));
        var child = children.save(new Crianca(
                request.nome(), request.dataNascimento(), request.genero(),
                request.diagnostico(), request.diagnosticoDetalhes(), request.observacoes()));
        links.save(new VinculoProfissionalCrianca(professional.getId(), child.getId()));
        if (request.responsavelPendente() != null) {
            var contact = request.responsavelPendente();
            pendingContacts.save(new ContatoResponsavelPendente(
                    child.getId(), contact.nome(), contact.email(),
                    contact.telefone(), contact.parentesco()));
        }
        return new CreateChildResponse("Criança cadastrada", ChildResponse.from(child));
    }

    @GetMapping
    public ChildListResponse list(Authentication authentication) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        List<Crianca> allowed = user.tipo() == TipoUsuario.PROFISSIONAL
                ? professionals.findByUsuarioId(user.id())
                        .map(item -> children.findLinkedToProfessional(item.getId()))
                        .orElse(List.of())
                : children.findLinkedToGuardian(user.id());
        var items = allowed.stream().map(ChildResponse::from).toList();
        return new ChildListResponse(items, items.size());
    }

    @GetMapping("/{id}")
    public ChildResponse get(Authentication authentication, @PathVariable Long id) {
        authorization.requireCrianca((AuthenticatedUser) authentication.getPrincipal(), id);
        return ChildResponse.from(children.findById(id).orElseThrow());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public ChildResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateChildRequest request) {
        authorization.requireCrianca((AuthenticatedUser) authentication.getPrincipal(), id);
        var child = children.findById(id).orElseThrow();
        child.update(
                request.nome(), request.dataNascimento(), request.genero(),
                request.diagnostico(), request.diagnosticoDetalhes(), request.observacoes());
        return ChildResponse.from(child);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    @Transactional
    public void archive(Authentication authentication, @PathVariable Long id) {
        authorization.requireCrianca((AuthenticatedUser) authentication.getPrincipal(), id);
        children.findById(id).orElseThrow().arquivar();
    }

    public record PendingGuardianRequest(
            @NotBlank String nome,
            String telefone,
            @Email String email,
            @NotBlank String parentesco) {
    }

    public record CreateChildRequest(
            @NotBlank String nome,
            @NotNull @Past LocalDate dataNascimento,
            String genero,
            String diagnostico,
            String diagnosticoDetalhes,
            String observacoes,
            @Valid PendingGuardianRequest responsavelPendente) {
    }

    public record UpdateChildRequest(
            @NotBlank String nome,
            @NotNull @Past LocalDate dataNascimento,
            String genero,
            String diagnostico,
            String diagnosticoDetalhes,
            String observacoes) {
    }

    public record CreateChildResponse(String message, ChildResponse crianca) {
    }

    public record ChildListResponse(List<ChildResponse> items, int total) {
    }

    public record ChildResponse(
            Long id,
            String nome,
            LocalDate dataNascimento,
            int idade,
            String genero,
            String diagnostico,
            String diagnosticoDetalhes,
            String observacoes) {
        public static ChildResponse from(Crianca child) {
            return new ChildResponse(
                    child.getId(),
                    child.getNome(),
                    child.getDataNascimento(),
                    Period.between(child.getDataNascimento(), LocalDate.now()).getYears(),
                    child.getGenero(),
                    child.getDiagnostico(),
                    child.getDiagnosticoDetalhes(),
                    child.getObservacoes());
        }
    }
}
