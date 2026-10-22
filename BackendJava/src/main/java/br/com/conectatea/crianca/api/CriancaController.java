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
import br.com.conectatea.vinculo.domain.HistoricoVinculo;
import br.com.conectatea.vinculo.infrastructure.HistoricoVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Comparator;
import br.com.conectatea.crianca.domain.StatusAcompanhamento;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
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
@io.swagger.v3.oas.annotations.tags.Tag(name = "Crianças")
public class CriancaController {
    private final CriancaRepository children;
    private final ContatoResponsavelPendenteRepository pendingContacts;
    private final ProfissionalRepository professionals;
    private final VinculoProfissionalRepository links;
    private final AuthorizationService authorization;
    private final ObjectProvider<HistoricoVinculoRepository> history;

    @org.springframework.beans.factory.annotation.Autowired
    public CriancaController(
            CriancaRepository children,
            ContatoResponsavelPendenteRepository pendingContacts,
            ProfissionalRepository professionals,
            VinculoProfissionalRepository links,
            AuthorizationService authorization,
            ObjectProvider<HistoricoVinculoRepository> history) {
        this.children = children;
        this.pendingContacts = pendingContacts;
        this.professionals = professionals;
        this.links = links;
        this.authorization = authorization;
        this.history = history;
    }

    public CriancaController(CriancaRepository children,
            ContatoResponsavelPendenteRepository pendingContacts,
            ProfissionalRepository professionals, VinculoProfissionalRepository links,
            AuthorizationService authorization) {
        this(children, pendingContacts, professionals, links, authorization,
                new org.springframework.beans.factory.support.DefaultListableBeanFactory()
                        .getBeanProvider(HistoricoVinculoRepository.class));
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
        child.updateStructured(request.escola(), request.escolaridade(), request.cidade(),
                request.uf(), request.interesses(), request.nivelSuporte());
        links.save(new VinculoProfissionalCrianca(professional.getId(), child.getId()));
        var historyRepository = history.getIfAvailable();
        if (historyRepository != null) historyRepository.save(new HistoricoVinculo(
                child.getId(), user.id(), null, professional.getId(),
                "VINCULO_PROFISSIONAL_CRIADO", "VINCULADO", null));
        if (request.responsavelPendente() != null) {
            var contact = request.responsavelPendente();
            pendingContacts.save(new ContatoResponsavelPendente(
                    child.getId(), contact.nome(), contact.email(),
                    contact.telefone(), contact.parentesco()));
        }
        return new CreateChildResponse("Criança cadastrada", ChildResponse.from(child));
    }

    @GetMapping
    public ChildListResponse list(Authentication authentication,@RequestParam(defaultValue="") String busca,@RequestParam(required=false) StatusAcompanhamento status,@RequestParam(defaultValue="false") boolean incluirArquivadas,@RequestParam(defaultValue="0") @Min(0) int pagina,@RequestParam(defaultValue="20") @Min(1) @Max(100) int tamanho,@RequestParam(defaultValue="nome") String ordenarPor) {
        var user = (AuthenticatedUser) authentication.getPrincipal();
        List<Crianca> allowed = user.tipo() == TipoUsuario.PROFISSIONAL
                ? professionals.findByUsuarioId(user.id())
                        .map(item -> incluirArquivadas?children.findAllLinkedToProfessional(item.getId()):children.findLinkedToProfessional(item.getId()))
                        .orElse(List.of())
                : incluirArquivadas?children.findAllLinkedToGuardian(user.id()):children.findLinkedToGuardian(user.id());
        var normalized=busca.trim().toLowerCase(java.util.Locale.ROOT);var filtered=allowed.stream().filter(c->normalized.isBlank()||c.getNome().toLowerCase(java.util.Locale.ROOT).contains(normalized)).filter(c->status==null||c.getStatusAcompanhamento()==status).sorted("dataNascimento".equals(ordenarPor)?Comparator.comparing(Crianca::getDataNascimento):Comparator.comparing(Crianca::getNome,String.CASE_INSENSITIVE_ORDER)).toList();var from=Math.min(filtered.size(),pagina*tamanho);var to=Math.min(filtered.size(),from+tamanho);return new ChildListResponse(filtered.subList(from,to).stream().map(ChildResponse::from).toList(),filtered.size());
    }
    public ChildListResponse list(Authentication authentication){return list(authentication,"",null,false,0,20,"nome");}

    @GetMapping("/{id}")
    public ChildResponse get(Authentication authentication, @PathVariable Long id) {
        authorization.requireCrianca((AuthenticatedUser) authentication.getPrincipal(), id);
        return ChildResponse.from(children.findById(id).orElseThrow());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSAVEL')")
    @Transactional
    public ChildResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateChildRequest request) {
        var actor = (AuthenticatedUser) authentication.getPrincipal();
        authorization.requireGestor(actor, id);
        authorization.requireCriancaWritable(actor, id);
        var child = children.findById(id).orElseThrow();
        child.update(
                request.nome(), request.dataNascimento(), request.genero(),
                request.diagnostico(), request.diagnosticoDetalhes(), request.observacoes());
        child.updateStructured(request.escola(), request.escolaridade(), request.cidade(),
                request.uf(), request.interesses(), request.nivelSuporte());
        return ChildResponse.from(child);
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
            String escola,
            String escolaridade,
            String cidade,
            @Pattern(regexp = "[A-Z]{2}") String uf,
            String interesses,
            @Min(1) @Max(3) Integer nivelSuporte,
            @Valid PendingGuardianRequest responsavelPendente) {
    }

    public record UpdateChildRequest(
            @NotBlank String nome,
            @NotNull @Past LocalDate dataNascimento,
            String genero,
            String diagnostico,
            String diagnosticoDetalhes,
            String observacoes,
            String escola,
            String escolaridade,
            String cidade,
            @Pattern(regexp = "[A-Z]{2}") String uf,
            String interesses,
            @Min(1) @Max(3) Integer nivelSuporte) {
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
            String observacoes,
            boolean arquivada,
            String escola,
            String escolaridade,
            String cidade,
            String uf,
            String interesses,
            Integer nivelSuporte,
            StatusAcompanhamento statusAcompanhamento) {
        public static ChildResponse from(Crianca child) {
            return new ChildResponse(
                    child.getId(),
                    child.getNome(),
                    child.getDataNascimento(),
                    Period.between(child.getDataNascimento(), LocalDate.now()).getYears(),
                    child.getGenero(),
                    child.getDiagnostico(),
                    child.getDiagnosticoDetalhes(),
                    child.getObservacoes(),
                    child.isArquivada(),
                    child.getEscola(), child.getEscolaridade(), child.getCidade(), child.getUf(),
                    child.getInteresses(), child.getNivelSuporte(),child.getStatusAcompanhamento());
        }
    }
}
