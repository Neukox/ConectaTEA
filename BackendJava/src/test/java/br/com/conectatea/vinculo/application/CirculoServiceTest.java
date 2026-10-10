package br.com.conectatea.vinculo.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.shared.domain.BusinessRuleException;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.PapelCirculo;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.util.List;
import org.junit.jupiter.api.Test;

class CirculoServiceTest {
    private final VinculoResponsavelRepository guardians = mock(VinculoResponsavelRepository.class);
    private final CirculoService service = new CirculoService(guardians,
            mock(VinculoProfissionalRepository.class), mock(ProfissionalRepository.class),
            mock(UsuarioRepository.class), mock(AuthorizationService.class));

    @Test
    void lastManagerCannotLeave() {
        var manager = guardian(1L, true);
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO)).thenReturn(List.of(manager));
        assertThatThrownBy(() -> service.leave(user(1L), 10L))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("LAST_MANAGER");
        assertThat(manager.getStatus()).isEqualTo(StatusVinculo.VINCULADO);
    }

    @Test
    void transferIsAtomicDomainOperationAndAllowsFormerManagerToLeaveLater() {
        var current = guardian(1L, true);
        var target = guardian(2L, false);
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(current, target));

        service.transferManagement(user(1L), 10L, 2L);

        assertThat(current.getPapel()).isEqualTo(PapelCirculo.RESPONSAVEL);
        assertThat(target.getPapel()).isEqualTo(PapelCirculo.RESPONSAVEL_GESTOR);
    }

    private VinculoResponsavelCrianca guardian(Long userId, boolean manager) {
        var link = new VinculoResponsavelCrianca(userId, 10L);
        if (manager) link.tornarGestor();
        return link;
    }

    private AuthenticatedUser user(Long id) {
        return new AuthenticatedUser(id, "user@example.test", TipoUsuario.RESPONSAVEL);
    }
}
