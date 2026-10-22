package br.com.conectatea.vinculo.api;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.application.CirculoService;
import br.com.conectatea.vinculo.application.VinculoService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

class VinculoControllerTest {
    @Test
    void legacyDeleteRouteDelegatesToProtectedCircleLeaveFlow() {
        var linkService = mock(VinculoService.class);
        var circle = mock(CirculoService.class);
        var authentication = mock(Authentication.class);
        var principal = new AuthenticatedUser(7L, "familia@example.test", TipoUsuario.RESPONSAVEL);
        when(authentication.getPrincipal()).thenReturn(principal);
        var controller = new VinculoController(linkService, circle, mock(CriancaRepository.class));

        controller.unlink(authentication, 12L);

        verify(circle).leave(principal, 12L);
    }
}
