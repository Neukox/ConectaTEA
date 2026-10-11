package br.com.conectatea.emailverification.application;

import br.com.conectatea.config.EmailVerificationProperties;
import br.com.conectatea.emailverification.domain.EmailVerificationToken;
import br.com.conectatea.emailverification.infrastructure.EmailVerificationTokenRepository;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class EmailVerificationService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final UsuarioRepository users;
    private final EmailVerificationTokenRepository tokens;
    private final EmailVerificationProperties properties;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public EmailVerificationService(UsuarioRepository users, EmailVerificationTokenRepository tokens,
            EmailVerificationProperties properties, ApplicationEventPublisher events, Clock clock) {
        this.users=users; this.tokens=tokens; this.properties=properties; this.events=events; this.clock=clock;
    }

    @Transactional
    public void issueForRegistration(Usuario user) { issue(user, false); }

    @Transactional
    public void request(String email) {
        users.findByEmailForUpdate(email.trim().toLowerCase(Locale.ROOT))
                .filter(Usuario::isAtivo).filter(user -> !user.isEmailConfirmado())
                .ifPresent(user -> issue(user, true));
    }

    private void issue(Usuario user, boolean enforceInterval) {
        var now=Instant.now(clock);
        if (enforceInterval) {
            var last=tokens.findFirstByUsuarioIdOrderByCreatedAtDesc(user.getId());
            if(last.isPresent() && last.get().getCreatedAt().plus(properties.resendInterval()).isAfter(now)) return;
        }
        tokens.invalidateActiveByUser(user.getId(), now);
        var raw=generate();
        tokens.save(new EmailVerificationToken(user, hash(raw), now.plus(properties.tokenTtl()), now));
        var url=UriComponentsBuilder.fromUri(properties.frontendUrl()).queryParam("token",raw).build().encode().toUri();
        events.publishEvent(new EmailVerificationRequestedEvent(user.getId(),user.getNome(),user.getEmail(),url));
    }

    @Transactional
    public void confirm(String rawToken) {
        var now=Instant.now(clock);
        var token=tokens.findByHashForUpdate(hash(rawToken)).orElseThrow(InvalidEmailVerificationTokenException::new);
        if(!token.utilizavelEm(now)||!token.getUsuario().isAtivo()) throw new InvalidEmailVerificationTokenException();
        token.consumir(now);
        token.getUsuario().confirmarEmail(now);
    }

    public VerificationStatus status(Long userId) {
        var user=users.findById(userId).orElseThrow();
        return new VerificationStatus(user.isEmailConfirmado(),user.getEmailConfirmadoEm());
    }

    private String generate(){var bytes=new byte[32];RANDOM.nextBytes(bytes);return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);}
    private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
    public record VerificationStatus(boolean confirmado, Instant confirmadoEm) {}
}
