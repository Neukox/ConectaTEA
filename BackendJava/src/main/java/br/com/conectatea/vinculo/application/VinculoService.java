package br.com.conectatea.vinculo.application;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.domain.Consentimento;
import br.com.conectatea.vinculo.domain.StatusToken;
import br.com.conectatea.vinculo.domain.TokenVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.ConsentimentoRepository;
import br.com.conectatea.vinculo.infrastructure.TokenVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
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
    private final SecureRandom random = new SecureRandom();
    private final String consentVersion;
    private final String consentPurpose;

    public VinculoService(
            TokenVinculoRepository tokens,
            CriancaRepository children,
            VinculoResponsavelRepository links,
            ConsentimentoRepository consents,
            @Value("${app.consent.version:1.0}") String consentVersion,
            @Value("${app.consent.purpose:Acompanhamento terapêutico da criança}")
                    String consentPurpose) {
        this.tokens = tokens;
        this.children = children;
        this.links = links;
        this.consents = consents;
        this.consentVersion = consentVersion;
        this.consentPurpose = consentPurpose;
    }

    @Transactional
    public GeneratedToken generate(Long childId, Long professionalId) {
        var randomBytes = new byte[18];
        random.nextBytes(randomBytes);
        var code = HexFormat.of().formatHex(randomBytes).toUpperCase();
        var expiresAt = Instant.now().plus(7, ChronoUnit.DAYS);
        var token = tokens.save(new TokenVinculo(hash(code), childId, professionalId, expiresAt));
        return new GeneratedToken(token.getId(), code, expiresAt, qrCode(code));
    }

    @Transactional(noRollbackFor = TokenGoneException.class)
    public Preview preview(String code) {
        var token = tokens.findByHashForUpdate(hash(code))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Token inválido"));
        validate(token);
        var child = children.findById(token.getCriancaId()).orElseThrow();
        return new Preview(child.getId(), child.getNome(), child.getDataNascimento(), child.getGenero());
    }

    @Transactional(noRollbackFor = TokenGoneException.class)
    public Preview confirm(
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

        links.findByResponsavelIdAndCriancaId(user.id(), token.getCriancaId())
                .ifPresentOrElse(
                        VinculoResponsavelCrianca::vincular,
                        () -> links.save(new VinculoResponsavelCrianca(
                                user.id(), token.getCriancaId())));
        consents.save(new Consentimento(
                user.id(), token.getCriancaId(), token.getProfissionalId(), ip, agent,
                consentVersion, consentPurpose));
        token.consumir(Instant.now());

        var child = children.findById(token.getCriancaId()).orElseThrow();
        return new Preview(child.getId(), child.getNome(), child.getDataNascimento(), child.getGenero());
    }

    @Transactional
    public void cancel(Long tokenId, Long childId, Long professionalId) {
        var token = tokens.findByIdForUpdate(tokenId).orElseThrow();
        if (!token.getCriancaId().equals(childId)
                || !token.getProfissionalId().equals(professionalId)) {
            throw new AccessDeniedException(
                    "Token não pertence ao profissional e à criança informados");
        }
        token.cancelar();
    }

    @Transactional
    public void unlink(Long childId, AuthenticatedUser user) {
        var link = links.findByResponsavelIdAndCriancaId(user.id(), childId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vínculo não encontrado"));
        link.desvincular();
    }

    private void validate(TokenVinculo token) {
        if (token.getStatus() != StatusToken.PENDENTE) {
            throw new TokenGoneException("Token indisponível");
        }
        if (!token.getExpiraEm().isAfter(Instant.now())) {
            token.expirar();
            throw new TokenGoneException("Token expirado");
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

    static class TokenGoneException extends ResponseStatusException {
        TokenGoneException(String reason) {
            super(HttpStatus.GONE, reason);
        }
    }
}
