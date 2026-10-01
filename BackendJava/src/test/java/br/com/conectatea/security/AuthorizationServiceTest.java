package br.com.conectatea.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class AuthorizationServiceTest {
    private final CriancaRepository children = org.mockito.Mockito.mock(CriancaRepository.class);
    private final ProfissionalRepository professionals =
            org.mockito.Mockito.mock(ProfissionalRepository.class);
    private final VinculoProfissionalRepository professionalLinks =
            org.mockito.Mockito.mock(VinculoProfissionalRepository.class);
    private final VinculoResponsavelRepository guardianLinks =
            org.mockito.Mockito.mock(VinculoResponsavelRepository.class);
    private final AuthorizationService service = new AuthorizationService(
            children, professionals, professionalLinks, guardianLinks);

    @Test
    void archivedChildIsDeniedBeforeCheckingLink() {
        var guardian = new AuthenticatedUser(5L, "familia@example.com", TipoUsuario.RESPONSAVEL);
        when(children.existsByIdAndArquivadaFalse(9L)).thenReturn(false);

        assertThat(service.canAccessCrianca(guardian, 9L)).isFalse();
        assertThatThrownBy(() -> service.requireCrianca(guardian, 9L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void guardianWithoutActiveLinkIsDenied() {
        var guardian = new AuthenticatedUser(5L, "familia@example.com", TipoUsuario.RESPONSAVEL);
        when(children.existsByIdAndArquivadaFalse(9L)).thenReturn(true);

        assertThatThrownBy(() -> service.requireCrianca(guardian, 9L))
                .isInstanceOf(AccessDeniedException.class);
    }
}
