package br.com.conectatea.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.config.AppProperties;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import jakarta.servlet.http.Cookie;
import java.util.Optional;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

class JwtAuthenticationFilterTest {
    private final JwtService jwt = mock(JwtService.class);
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwt, usuarios);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void inactiveUserCannotReuseValidJwt() throws Exception {
        var claims = claims(0L);
        var usuario = user(false);
        when(jwt.parse("valid-token")).thenReturn(claims);
        when(usuarios.findById(42L)).thenReturn(Optional.of(usuario));

        executeFilter();

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void activeUserIsLoadedFromDatabaseBeforeAuthentication() throws Exception {
        var claims = new AuthenticatedUser(42L, "stale@example.com", TipoUsuario.PROFISSIONAL,Instant.parse("2026-10-05T12:00:00Z"),0L);
        var usuario = user(true);
        when(jwt.parse("valid-token")).thenReturn(claims);
        when(usuarios.findById(42L)).thenReturn(Optional.of(usuario));

        executeFilter();

        var principal = (AuthenticatedUser) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        assertThat(principal.email()).isEqualTo("responsavel@example.com");
        assertThat(principal.tipo()).isEqualTo(TipoUsuario.RESPONSAVEL);
    }

    @Test
    void divergentCredentialsVersionIsRejected() throws Exception {
        var claims=claims(0L);
        var usuario=user(true);ReflectionTestUtils.setField(usuario,"credentialsVersion",1L);
        when(jwt.parse("valid-token")).thenReturn(claims);when(usuarios.findById(42L)).thenReturn(Optional.of(usuario));executeFilter();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void matchingCredentialsVersionIsAccepted() throws Exception {
        var claims=claims(0L);
        var usuario=user(true);
        when(jwt.parse("valid-token")).thenReturn(claims);when(usuarios.findById(42L)).thenReturn(Optional.of(usuario));executeFilter();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    @Test
    void missingCredentialsVersionIsRejected() throws Exception {
        when(jwt.parse("valid-token")).thenReturn(new AuthenticatedUser(42L,"responsavel@example.com",TipoUsuario.RESPONSAVEL));
        when(usuarios.findById(42L)).thenReturn(Optional.of(user(true)));
        executeFilter();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void invalidJwtIsRejected() throws Exception {
        when(jwt.parse("valid-token")).thenThrow(new IllegalArgumentException("invalid"));
        executeFilter();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void passwordChangeRevokesOldJwtEvenInSameSecondAndNewLoginIsAccepted() throws Exception {
        var properties=new AppProperties(new AppProperties.Jwt("0123456789012345678901234567890123456789",Duration.ofHours(1)),new AppProperties.Cors("http://localhost:5173"),new AppProperties.Cookie(false,"Lax"));
        var realJwt=new JwtService(properties);var usuario=user(true);var oldToken=realJwt.issue(usuario);var issuedAt=realJwt.parse(oldToken).issuedAt();
        usuario.atualizarSenha("new-hash",issuedAt);
        when(usuarios.findById(42L)).thenReturn(Optional.of(usuario));
        var realFilter=new JwtAuthenticationFilter(realJwt,usuarios);
        executeFilter(realFilter,oldToken);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        executeFilter(realFilter,realJwt.issue(usuario));
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    private void executeFilter() throws Exception {
        executeFilter(filter,"valid-token");
    }

    private void executeFilter(JwtAuthenticationFilter target,String token) throws Exception {
        SecurityContextHolder.clearContext();
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("jwt", token));
        target.doFilter(request, new MockHttpServletResponse(), (req, res) -> { });
    }

    private AuthenticatedUser claims(long credentialsVersion){return new AuthenticatedUser(42L,"responsavel@example.com",TipoUsuario.RESPONSAVEL,Instant.parse("2026-10-05T12:00:00Z"),credentialsVersion);}

    private Usuario user(boolean active) {
        var usuario = new Usuario(
                "Responsável", "responsavel@example.com", "hash", null, null,
                TipoUsuario.RESPONSAVEL);
        ReflectionTestUtils.setField(usuario, "id", 42L);
        if (!active) {
            usuario.desativar();
        }
        return usuario;
    }
}
