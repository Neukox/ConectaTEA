package br.com.conectatea.vinculo.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.Consentimento;
import br.com.conectatea.vinculo.domain.HistoricoVinculo;
import br.com.conectatea.vinculo.domain.StatusToken;
import br.com.conectatea.vinculo.domain.TokenVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.ConsentimentoRepository;
import br.com.conectatea.vinculo.infrastructure.HistoricoVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.TokenVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import br.com.conectatea.vinculo.infrastructure.SolicitacaoTokenVinculoRepository;
import br.com.conectatea.vinculo.domain.SolicitacaoTokenVinculo;
import br.com.conectatea.shared.domain.BusinessRuleException;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VinculoService {
    private final TokenVinculoRepository tokens;
    private final CriancaRepository children;
    private final VinculoResponsavelRepository links;
    private final ConsentimentoRepository consents;
    private final HistoricoVinculoRepository history;
    private final AuditLogService audits;
    private final SolicitacaoTokenVinculoRepository requests;
    private final UsuarioRepository users;
    private final SecureRandom random = new SecureRandom();
    private final String consentVersion;
    private final String consentPurpose;

    @Autowired
    public VinculoService(
            TokenVinculoRepository tokens,
            CriancaRepository children,
            VinculoResponsavelRepository links,
            ConsentimentoRepository consents,
            HistoricoVinculoRepository history,
            AuditLogService audits,
            SolicitacaoTokenVinculoRepository requests,
            UsuarioRepository users,
            @Value("${app.consent.version:1.0}") String consentVersion,
            @Value("${app.consent.purpose:Acompanhamento terapêutico da criança}")
                    String consentPurpose) {
        this.tokens = tokens;
        this.children = children;
        this.links = links;
        this.consents = consents;
        this.history = history;
        this.audits = audits;
        this.requests = requests;
        this.users = users;
        this.consentVersion = consentVersion;
        this.consentPurpose = consentPurpose;
    }

    public VinculoService(TokenVinculoRepository tokens, CriancaRepository children,
            VinculoResponsavelRepository links, ConsentimentoRepository consents,
            String consentVersion, String consentPurpose) {
        this(tokens, children, links, consents, null, null, null, null, consentVersion, consentPurpose);
    }

    @Transactional
    public GeneratedToken generate(Long childId, Long professionalId) {
        return generate(childId, professionalId, null);
    }

    @Transactional
    public GeneratedToken generate(Long childId, Long professionalId, Long actorId) {
        var randomBytes = new byte[18];
        random.nextBytes(randomBytes);
        var code = HexFormat.of().formatHex(randomBytes).toUpperCase();
        var expiresAt = Instant.now().plus(7, ChronoUnit.DAYS);
        var token = tokens.save(new TokenVinculo(hash(code), childId, professionalId, expiresAt));
        audit(actorId, "TOKEN_VINCULO_GERADO", "TOKEN_VINCULO", token.getId(), childId, professionalId, null);
        return new GeneratedToken(token.getId(), code, expiresAt, qrCode(code));
    }

    @Transactional(noRollbackFor = TokenGoneException.class)
    public Preview preview(String code) {
        var token = tokens.findByHashForUpdate(hash(code))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Token inválido"));
        validate(token);
        var child = children.findById(token.getCriancaId()).orElseThrow();
        if (child.isArquivada()) {
            throw new BusinessRuleException(
                    "CHILD_ARCHIVED", "Criança arquivada não aceita solicitação");
        }
        return new Preview(child.getId(), child.getNome(), child.getDataNascimento(), child.getGenero());
    }

    @Transactional(noRollbackFor = TokenGoneException.class)
    public LinkRequest confirm(
            String code,
            boolean accepted,
            AuthenticatedUser user,
            String ip,
            String agent) {
        if (user.tipo() != TipoUsuario.RESPONSAVEL) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Somente responsável pode confirmar vínculo");
        }
        if (!accepted) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Consentimento obrigatório");
        }
        var token = tokens.findByHashForUpdate(hash(code))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Token inválido"));
        validate(token);

        var child = children.findById(token.getCriancaId()).orElseThrow();
        if (child.isArquivada()) throw new BusinessRuleException("CHILD_ARCHIVED", "Criança arquivada não aceita solicitação");
        if (requests == null) throw new BusinessRuleException("LINK_FLOW_UNAVAILABLE", "Fluxo seguro de solicitação indisponível");
        var request = requests.save(new SolicitacaoTokenVinculo(
                token.getId(), token.getCriancaId(), user.id(), ip, agent));
        token.consumir(Instant.now());
        recordHistory(token.getCriancaId(), user.id(), user.id(), token.getProfissionalId(),
                "SOLICITACAO_VINCULO_CRIADA", "PENDENTE", null);
        audit(user.id(), "TOKEN_VINCULO_RESERVADO", "TOKEN_VINCULO", token.getId(),
                token.getCriancaId(), token.getProfissionalId(), "solicitacaoId=" + request.getId());
        return new LinkRequest(request.getId(), request.getCriancaId(), request.getStatus());
    }

    @Transactional
    public LinkRequest decideRequest(Long childId, Long requestId, boolean approve,
                                     AuthenticatedUser manager) {
        var child = children.findById(childId).orElseThrow();
        if (child.isArquivada()) throw new BusinessRuleException("CHILD_ARCHIVED", "Criança arquivada não aceita aprovação");
        var active = links.lockActiveByChild(childId, br.com.conectatea.vinculo.domain.StatusVinculo.VINCULADO);
        var managerLink = active.stream().filter(item -> item.getResponsavelId().equals(manager.id())).findFirst()
                .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
        if (!managerLink.isGestor()) throw new AccessDeniedException("Somente gestor decide solicitações");
        var request = requests.findByIdForUpdate(requestId).orElseThrow();
        if (!request.getCriancaId().equals(childId)) throw new AccessDeniedException("Solicitação pertence a outra criança");
        var requester = users.findById(request.getSolicitanteUsuarioId()).orElseThrow();
        if (!requester.isAtivo()) throw new BusinessRuleException("REQUESTER_INACTIVE", "Solicitante não está ativo");
        if (active.stream().anyMatch(item -> item.getResponsavelId().equals(request.getSolicitanteUsuarioId()))) {
            throw new BusinessRuleException("ALREADY_LINKED", "Solicitante já possui vínculo ativo");
        }
        if (!approve) {
            request.reject(manager.id());
            recordHistory(childId, manager.id(), request.getSolicitanteUsuarioId(), null,
                    "SOLICITACAO_VINCULO_RECUSADA", "RECUSADA", null);
            audit(manager.id(), "SOLICITACAO_VINCULO_RECUSADA", "SOLICITACAO_VINCULO",
                    request.getId(), childId, null, null);
            return new LinkRequest(request.getId(), childId, request.getStatus());
        }
        request.approve(manager.id());
        var token = tokens.findById(request.getTokenId()).orElseThrow();
        var existing = links.findByResponsavelIdAndCriancaId(request.getSolicitanteUsuarioId(), childId);
        existing.ifPresentOrElse(link -> link.vincularComo(br.com.conectatea.vinculo.domain.PapelCirculo.RESPONSAVEL),
                () -> links.save(new VinculoResponsavelCrianca(request.getSolicitanteUsuarioId(), childId)));
        consents.save(new Consentimento(request.getSolicitanteUsuarioId(), childId,
                token.getProfissionalId(), request.getIp(), request.getUserAgent(),
                consentVersion, consentPurpose));
        recordHistory(childId, manager.id(), request.getSolicitanteUsuarioId(),
                token.getProfissionalId(), "SOLICITACAO_VINCULO_APROVADA", "VINCULADO", null);
        audit(manager.id(), "SOLICITACAO_VINCULO_APROVADA", "SOLICITACAO_VINCULO",
                request.getId(), childId, token.getProfissionalId(), null);
        return new LinkRequest(request.getId(), childId, request.getStatus());
    }

    @Transactional
    public void cancel(Long tokenId, Long childId, Long professionalId) {
        cancel(tokenId, childId, professionalId, null);
    }

    @Transactional
    public void cancel(Long tokenId, Long childId, Long professionalId, Long actorId) {
        var token = tokens.findByIdForUpdate(tokenId).orElseThrow();
        if (!token.getCriancaId().equals(childId)
                || !token.getProfissionalId().equals(professionalId)) {
            throw new AccessDeniedException(
                    "Token não pertence ao profissional e à criança informados");
        }
        token.cancelar();
        audit(actorId, "TOKEN_VINCULO_CANCELADO", "TOKEN_VINCULO", tokenId, childId, professionalId, null);
    }

    private void validate(TokenVinculo token) {
        if (token.getStatus() != StatusToken.PENDENTE) {
            throw new TokenGoneException("Token indisponível");
        }
        if (!token.getExpiraEm().isAfter(Instant.now())) {
            token.expirar();
            audit(null, "TOKEN_VINCULO_EXPIRADO", "TOKEN_VINCULO", token.getId(), token.getCriancaId(), token.getProfissionalId(), null);
            throw new TokenGoneException("Token expirado");
        }
    }

    private void recordHistory(Long child, Long actor, Long guardian, Long professional, String event, String status, String reason) {
        if (history != null) history.save(new HistoricoVinculo(child, actor, guardian, professional, event, status, reason));
    }

    private void audit(Long actor, String event, String resource, Long resourceId, Long child, Long professional, String metadata) {
        try {
            if (audits != null) audits.record(actor, event, resource, resourceId, child, professional, "SUCESSO", metadata);
        } catch (RuntimeException ignored) {
            // A falha já é registrada pelo serviço; auditoria secundária não invalida o fato principal.
        }
    }

    private String hash(String value) {
        try {
            var bytes = value.trim().toUpperCase().getBytes(StandardCharsets.UTF_8);
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private String qrCode(String code) {
        try {
            var matrix = new MultiFormatWriter().encode(code, BarcodeFormat.QR_CODE, 280, 280);
            var image = new BufferedImage(280, 280, BufferedImage.TYPE_INT_RGB);
            for (var x = 0; x < 280; x++) {
                for (var y = 0; y < 280; y++) {
                    image.setRGB(x, y, matrix.get(x, y) ? 0xFF000000 : 0xFFFFFFFF);
                }
            }
            var output = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", output);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(output.toByteArray());
        } catch (Exception exception) {
            throw new IllegalStateException("Não foi possível gerar o QR Code", exception);
        }
    }

    public record GeneratedToken(Long id, String codigo, Instant expiraEm, String qrCodeDataUrl) {
    }

    public record Preview(Long id, String nome, LocalDate dataNascimento, String genero) {
    }
    public record LinkRequest(Long solicitacaoId, Long criancaId, String status) {}

    static class TokenGoneException extends ResponseStatusException {
        TokenGoneException(String reason) {
            super(HttpStatus.GONE, reason);
        }
    }
}
