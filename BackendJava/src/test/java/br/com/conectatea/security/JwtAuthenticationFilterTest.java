package br.com.conectatea.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import jakarta.servlet.http.Cookie;
import java.util.Optional;
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
        var claims = new AuthenticatedUser(42L, "responsavel@example.com", TipoUsuario.RESPONSAVEL);
        var usuario = user(false);
        when(jwt.parse("valid-token")).thenReturn(claims);
        when(usuarios.findById(42L)).thenReturn(Optional.of(usuario));

        executeFilter();

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void activeUserIsLoadedFromDatabaseBeforeAuthentication() throws Exception {
        var claims = new AuthenticatedUser(42L, "stale@example.com", TipoUsuario.PROFISSIONAL);
        var usuario = user(true);
        when(jwt.parse("valid-token")).thenReturn(claims);
        when(usuarios.findById(42L)).thenReturn(Optional.of(usuario));

        executeFilter();

        var principal = (AuthenticatedUser) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        assertThat(principal.email()).isEqualTo("responsavel@example.com");
        assertThat(principal.tipo()).isEqualTo(TipoUsuario.RESPONSAVEL);
    }

    private void executeFilter() throws Exception {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("jwt", "valid-token"));
        filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> { });
    }

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
