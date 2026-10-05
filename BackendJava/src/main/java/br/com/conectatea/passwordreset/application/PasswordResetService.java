package br.com.conectatea.passwordreset.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.config.PasswordResetProperties;
import br.com.conectatea.passwordreset.domain.PasswordResetToken;
import br.com.conectatea.passwordreset.infrastructure.PasswordResetTokenRepository;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class PasswordResetService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final UsuarioRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder passwords;
    private final PasswordResetNotifier notifier;
    private final PasswordResetProperties properties;
    private final AuditLogService audits;
    private final Clock clock;

    public PasswordResetService(UsuarioRepository users, PasswordResetTokenRepository tokens,
            PasswordEncoder passwords, PasswordResetNotifier notifier,
            PasswordResetProperties properties, AuditLogService audits) {
        this(users, tokens, passwords, notifier, properties, audits, Clock.systemUTC());
    }

    PasswordResetService(UsuarioRepository users, PasswordResetTokenRepository tokens,
            PasswordEncoder passwords, PasswordResetNotifier notifier,
            PasswordResetProperties properties, AuditLogService audits, Clock clock) {
        this.users=users;this.tokens=tokens;this.passwords=passwords;this.notifier=notifier;
        this.properties=properties;this.audits=audits;this.clock=clock;
    }

    @Transactional
    public void requestPasswordReset(String email) {
        users.findByEmailForUpdate(email.trim().toLowerCase(Locale.ROOT)).filter(user -> user.isAtivo()).ifPresent(user -> {
            var now=Instant.now(clock);
            tokens.invalidateActiveByUser(user.getId(),now);
            var rawToken=generateToken();
            tokens.save(new PasswordResetToken(user,hash(rawToken),now.plus(properties.tokenTtl()),now));
            notifier.sendPasswordReset(user.getEmail(),buildResetUrl(rawToken));
            audits.record(user.getId(),"PASSWORD_RESET_REQUESTED","USUARIO",user.getId(),null,null,"SUCESSO",null);
        });
    }

    @Transactional
    public void resetPassword(String rawToken,String newPassword) {
        var now=Instant.now(clock);
        var token=tokens.findByHashForUpdate(hash(rawToken)).orElseThrow(InvalidPasswordResetTokenException::new);
        if(!token.isUsableAt(now)||!token.getUsuario().isAtivo())throw new InvalidPasswordResetTokenException();
        token.getUsuario().atualizarSenha(passwords.encode(newPassword));
        token.consume(now);
        audits.record(token.getUsuario().getId(),"PASSWORD_RESET_COMPLETED","USUARIO",token.getUsuario().getId(),null,null,"SUCESSO",null);
    }

    private String generateToken(){var bytes=new byte[32];SECURE_RANDOM.nextBytes(bytes);return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);}
    private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException("SHA-256 indisponível",e);}}
    private URI buildResetUrl(String token){return UriComponentsBuilder.fromUri(properties.frontendUrl()).queryParam("token",token).build().encode().toUri();}
}
