package br.com.conectatea.security;

import br.com.conectatea.config.AppProperties;
import br.com.conectatea.usuario.domain.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final AppProperties properties;
    private final SecretKey key;
    public JwtService(AppProperties properties){this.properties=properties;this.key=Keys.hmacShaKeyFor(properties.jwt().secret().getBytes(StandardCharsets.UTF_8));}
    public String issue(Usuario user){var now=Instant.now();return Jwts.builder().subject(user.getId().toString()).claim("email",user.getEmail()).claim("tipo",user.getTipo().name()).issuedAt(Date.from(now)).expiration(Date.from(now.plus(properties.jwt().expiration()))).signWith(key).compact();}
    public AuthenticatedUser parse(String token){var claims=Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();return new AuthenticatedUser(Long.valueOf(claims.getSubject()),claims.get("email",String.class),br.com.conectatea.usuario.domain.TipoUsuario.valueOf(claims.get("tipo",String.class)),claims.getIssuedAt().toInstant());}
}

