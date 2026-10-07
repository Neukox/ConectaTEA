package br.com.conectatea.anotacao.application;

import br.com.conectatea.anotacao.domain.Anotacao;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import br.com.conectatea.anotacao.infrastructure.AnotacaoRepository;
import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnotacaoService {
    private final AnotacaoRepository anotacoes;
    private final CriancaRepository criancas;
    private final ProfissionalRepository profissionais;
    private final UsuarioRepository usuarios;
    private final AuthorizationService autorizacaoCrianca;
    private final AnotacaoAuthorizationService autorizacaoAnotacao;
    private final AuditLogService auditoria;

    public AnotacaoService(
            AnotacaoRepository anotacoes,
            CriancaRepository criancas,
            ProfissionalRepository profissionais,
            UsuarioRepository usuarios,
            AuthorizationService autorizacaoCrianca,
            AnotacaoAuthorizationService autorizacaoAnotacao,
            AuditLogService auditoria) {
        this.anotacoes = anotacoes;
        this.criancas = criancas;
        this.profissionais = profissionais;
        this.usuarios = usuarios;
        this.autorizacaoCrianca = autorizacaoCrianca;
        this.autorizacaoAnotacao = autorizacaoAnotacao;
        this.auditoria = auditoria;
    }

    @Transactional
    public AnotacaoView criar(
            AuthenticatedUser usuario,
            Long criancaId,
            String conteudo,
            VisibilidadeAnotacao visibilidade) {
        exigirProfissional(usuario);
        autorizacaoCrianca.requireCrianca(usuario, criancaId);
        var profissional = profissional(usuario);
        var crianca = criancas.findById(criancaId).orElseThrow(NoSuchElementException::new);
        var anotacao = anotacoes.save(new Anotacao(crianca, profissional, conteudo, visibilidade));
        auditoria.record(
                usuario.id(), "ANNOTATION_CREATED", "ANOTACAO", anotacao.getId(), criancaId,
                profissional.getId(), "SUCESSO", "visibilidade=" + visibilidade);
        return mapear(anotacao, usuario, profissional.getId(), nomeUsuario(profissional));
    }

    @Transactional(readOnly = true)
    public List<AnotacaoView> listar(
            AuthenticatedUser usuario,
            Long criancaId,
            VisibilidadeAnotacao visibilidade,
            Long profissionalId,
            String busca,
            String ordenacao) {
        autorizacaoCrianca.requireCrianca(usuario, criancaId);
        if (usuario.tipo() == TipoUsuario.RESPONSAVEL
                && visibilidade == VisibilidadeAnotacao.PRIVADA) {
            throw new IllegalArgumentException("Filtro de visibilidade não permitido para responsável");
        }
        var profissionalAtualId = profissionalAtualId(usuario);
        var filtroSeguro = usuario.tipo() == TipoUsuario.RESPONSAVEL
                ? VisibilidadeAnotacao.COMPARTILHADA
                : visibilidade;
        var direction = parseOrdenacao(ordenacao);
        var encontrados = anotacoes.findVisiveis(
                criancaId,
                profissionalAtualId,
                filtroSeguro,
                profissionalId,
                busca == null ? "" : busca.trim(),
                Sort.by(direction, "createdAt"));
        var nomes = nomesUsuarios(encontrados);
        return encontrados.stream()
                .map(item -> mapear(
                        item,
                        usuario,
                        profissionalAtualId,
                        nomes.getOrDefault(item.getAutor().getUsuarioId(), "Profissional")))
                .toList();
    }

    @Transactional(readOnly = true)
    public AnotacaoView buscar(AuthenticatedUser usuario, Long criancaId, Long anotacaoId) {
        autorizacaoCrianca.requireCrianca(usuario, criancaId);
        var anotacao = anotacaoDaCrianca(criancaId, anotacaoId);
        var profissionalAtualId = profissionalAtualId(usuario);
        autorizacaoAnotacao.exigirVisualizacao(usuario, profissionalAtualId, anotacao);
        return mapear(anotacao, usuario, profissionalAtualId, nomeUsuario(anotacao.getAutor()));
    }

    @Transactional
    public AnotacaoView atualizar(
            AuthenticatedUser usuario,
            Long criancaId,
            Long anotacaoId,
            String conteudo,
            VisibilidadeAnotacao visibilidade) {
        exigirProfissional(usuario);
        autorizacaoCrianca.requireCrianca(usuario, criancaId);
        var profissional = profissional(usuario);
        var anotacao = anotacaoDaCrianca(criancaId, anotacaoId);
        autorizacaoAnotacao.exigirAutoria(profissional.getId(), anotacao);
        anotacao.atualizar(conteudo, visibilidade);
        auditoria.record(
                usuario.id(), "ANNOTATION_UPDATED", "ANOTACAO", anotacaoId, criancaId,
                profissional.getId(), "SUCESSO", "visibilidade=" + visibilidade);
        return mapear(anotacao, usuario, profissional.getId(), nomeUsuario(profissional));
    }

    @Transactional
    public void excluir(AuthenticatedUser usuario, Long criancaId, Long anotacaoId) {
        exigirProfissional(usuario);
        autorizacaoCrianca.requireCrianca(usuario, criancaId);
        var profissional = profissional(usuario);
        var anotacao = anotacaoDaCrianca(criancaId, anotacaoId);
        autorizacaoAnotacao.exigirAutoria(profissional.getId(), anotacao);
        var visibilidade = anotacao.getVisibilidade();
        anotacoes.delete(anotacao);
        auditoria.record(
                usuario.id(), "ANNOTATION_DELETED", "ANOTACAO", anotacaoId, criancaId,
                profissional.getId(), "SUCESSO", "visibilidade=" + visibilidade);
    }

    private Anotacao anotacaoDaCrianca(Long criancaId, Long anotacaoId) {
        return anotacoes.findByIdAndCriancaId(anotacaoId, criancaId)
                .orElseThrow(NoSuchElementException::new);
    }

    private Profissional profissional(AuthenticatedUser usuario) {
        return profissionais.findByUsuarioId(usuario.id())
                .orElseThrow(() -> new NoSuchElementException("Perfil profissional não encontrado"));
    }

    private Long profissionalAtualId(AuthenticatedUser usuario) {
        return usuario.tipo() == TipoUsuario.PROFISSIONAL
                ? profissional(usuario).getId()
                : null;
    }

    private void exigirProfissional(AuthenticatedUser usuario) {
        if (usuario.tipo() != TipoUsuario.PROFISSIONAL) {
            throw new AccessDeniedException("Somente profissionais podem alterar anotações");
        }
    }

    private Sort.Direction parseOrdenacao(String ordenacao) {
        if (ordenacao == null || ordenacao.isBlank()
                || ordenacao.toUpperCase(Locale.ROOT).equals("RECENTES")) {
            return Sort.Direction.DESC;
        }
        if (ordenacao.toUpperCase(Locale.ROOT).equals("ANTIGAS")) {
            return Sort.Direction.ASC;
        }
        throw new IllegalArgumentException("ordenação inválida");
    }

    private Map<Long, String> nomesUsuarios(List<Anotacao> items) {
        var ids = items.stream().map(item -> item.getAutor().getUsuarioId()).distinct().toList();
        return usuarios.findAllById(ids).stream()
                .collect(Collectors.toMap(Usuario::getId, Usuario::getNome));
    }

    private String nomeUsuario(Profissional profissional) {
        return usuarios.findById(profissional.getUsuarioId())
                .map(Usuario::getNome)
                .orElse("Profissional");
    }

    private AnotacaoView mapear(
            Anotacao anotacao,
            AuthenticatedUser usuario,
            Long profissionalAtualId,
            String autorNome) {
        var isAutor = usuario.tipo() == TipoUsuario.PROFISSIONAL
                && profissionalAtualId != null
                && profissionalAtualId.equals(anotacao.getAutor().getId());
        return new AnotacaoView(
                anotacao.getId(),
                anotacao.getCrianca().getId(),
                anotacao.getCrianca().getNome(),
                anotacao.getAutor().getId(),
                autorNome,
                anotacao.getAutor().getEspecialidade(),
                anotacao.getConteudo(),
                anotacao.getVisibilidade(),
                anotacao.getCreatedAt(),
                anotacao.getUpdatedAt(),
                isAutor);
    }
}
