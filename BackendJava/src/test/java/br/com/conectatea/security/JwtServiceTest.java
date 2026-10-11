package br.com.conectatea.security;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import br.com.conectatea.config.AppProperties; import br.com.conectatea.usuario.domain.*; import java.time.Duration; import org.junit.jupiter.api.Test; import org.springframework.test.util.ReflectionTestUtils;
import io.jsonwebtoken.Jwts; import io.jsonwebtoken.security.Keys; import java.nio.charset.StandardCharsets; import java.time.Instant; import java.util.Date;
class JwtServiceTest {
 private static final String SECRET="0123456789012345678901234567890123456789";
 private AppProperties properties(){return new AppProperties(new AppProperties.Jwt(SECRET,Duration.ofHours(1)),new AppProperties.Cors("http://localhost:5173"),new AppProperties.Cookie(false,"Lax"));}
 @Test void roundTripKeepsIdentityIssuedAtAndCredentialsVersion(){var service=new JwtService(properties());var user=new Usuario("Maria","MARIA@example.com","hash",null,null,TipoUsuario.RESPONSAVEL);ReflectionTestUtils.setField(user,"id",42L);ReflectionTestUtils.setField(user,"credentialsVersion",7L);var token=service.issue(user);var parsed=service.parse(token);assertThat(parsed.id()).isEqualTo(42L);assertThat(parsed.email()).isEqualTo("maria@example.com");assertThat(parsed.tipo()).isEqualTo(TipoUsuario.RESPONSAVEL);assertThat(parsed.issuedAt()).isNotNull();assertThat(parsed.credentialsVersion()).isEqualTo(7L);}
 @Test void legacyJwtWithoutCredentialsVersionIsInvalid(){var now=Instant.now();var token=Jwts.builder().subject("42").claim("email","maria@example.com").claim("tipo","RESPONSAVEL").issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(3600))).signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();assertThatThrownBy(()->new JwtService(properties()).parse(token)).isInstanceOf(IllegalArgumentException.class);}
}
