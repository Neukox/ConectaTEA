package br.com.conectatea.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.domain.StatusVinculo;
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

    @Test
    void guardianComVinculoSomenteDesvinculadoNaoAcessaCrianca() {
        var guardian = new AuthenticatedUser(5L, "familia@example.com", TipoUsuario.RESPONSAVEL);
        when(children.existsById(9L)).thenReturn(true);
        when(guardianLinks.existsByResponsavelIdAndCriancaIdAndStatus(
                5L, 9L, StatusVinculo.VINCULADO)).thenReturn(false);
        when(guardianLinks.existsByResponsavelIdAndCriancaIdAndStatus(
                5L, 9L, StatusVinculo.DESVINCULADO)).thenReturn(true);

        assertThat(service.canAccessCrianca(guardian, 9L)).isFalse();
        assertThatThrownBy(() -> service.requireCrianca(guardian, 9L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void guardianComVinculoAtivoAcessaCrianca() {
        var guardian = new AuthenticatedUser(5L, "familia@example.com", TipoUsuario.RESPONSAVEL);
        when(children.existsById(9L)).thenReturn(true);
        when(guardianLinks.existsByResponsavelIdAndCriancaIdAndStatus(
                5L, 9L, StatusVinculo.VINCULADO)).thenReturn(true);

        assertThat(service.canAccessCrianca(guardian, 9L)).isTrue();
    }

    @Test
    void profissionalComVinculoSomenteDesvinculadoNaoAcessaCrianca() {
        var professional = new AuthenticatedUser(7L, "prof@example.com", TipoUsuario.PROFISSIONAL);
        when(children.existsById(9L)).thenReturn(true);
        when(professionals.findByUsuarioId(7L)).thenReturn(java.util.Optional.of(professional(31L)));
        when(professionalLinks.existsByProfissionalIdAndCriancaIdAndStatus(
                31L, 9L, StatusVinculo.VINCULADO)).thenReturn(false);
        when(professionalLinks.existsByProfissionalIdAndCriancaIdAndStatus(
                31L, 9L, StatusVinculo.DESVINCULADO)).thenReturn(true);

        assertThat(service.canAccessCrianca(professional, 9L)).isFalse();
    }

    private br.com.conectatea.profissional.domain.Profissional professional(Long id) {
        var result =
                new br.com.conectatea.profissional.domain.Profissional(7L, "PROF" + id);
        org.springframework.test.util.ReflectionTestUtils.setField(result, "id", id);
        return result;
    }
}
