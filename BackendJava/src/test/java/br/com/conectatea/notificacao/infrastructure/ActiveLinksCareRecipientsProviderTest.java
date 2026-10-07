package br.com.conectatea.notificacao.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ActiveLinksCareRecipientsProviderTest {
    @Mock VinculoProfissionalRepository professionalLinks;
    @Mock VinculoResponsavelRepository guardianLinks;
    @Mock ProfissionalRepository professionals;
    @Mock UsuarioRepository users;

    @Test
    void resolveAtivosExcluiAtorInativoEDuplicidades() {
        var joaoLink = new VinculoProfissionalCrianca(20L, 10L);
        var anaLink = new VinculoProfissionalCrianca(21L, 10L);
        var paulaLink = new VinculoResponsavelCrianca(3L, 10L);
        var duplicatePaulaLink = new VinculoResponsavelCrianca(3L, 10L);
        when(professionalLinks.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(joaoLink, anaLink));
        when(guardianLinks.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(paulaLink, duplicatePaulaLink));
        when(professionals.findAllById(List.of(20L, 21L)))
                .thenReturn(List.of(professional(20L, 1L), professional(21L, 2L)));
        var actor = user(1L, "João", TipoUsuario.PROFISSIONAL, true);
        var ana = user(2L, "Ana", TipoUsuario.PROFISSIONAL, true);
        var paula = user(3L, "Paula", TipoUsuario.RESPONSAVEL, true);
        var inactive = user(4L, "Inativo", TipoUsuario.RESPONSAVEL, false);
        when(users.findAllById(org.mockito.ArgumentMatchers.any())).thenReturn(List.of(actor, ana, paula, inactive));

        var result = new ActiveLinksCareRecipientsProvider(
                professionalLinks, guardianLinks, professionals, users)
                .findActiveRecipients(10L, 1L);

        assertThat(result).extracting(item -> item.usuarioId()).containsExactly(2L, 3L);
    }

    private Profissional professional(Long id, Long userId) {
        var result = new Profissional(userId, "P" + id);
        ReflectionTestUtils.setField(result, "id", id);
        return result;
    }

    private Usuario user(Long id, String name, TipoUsuario role, boolean active) {
        var result = new Usuario(name, id + "@test.local", "hash", null, null, role);
        ReflectionTestUtils.setField(result, "id", id);
        if (!active) result.desativar();
        return result;
    }
}
