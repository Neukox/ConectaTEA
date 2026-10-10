package br.com.conectatea.sessao.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.sessao.domain.Sessao;
import br.com.conectatea.sessao.domain.TipoSessao;
import br.com.conectatea.sessao.infrastructure.SessaoRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

class SessaoControllerPrivacyTest {
    private final SessaoRepository sessions = mock(SessaoRepository.class);
    private final CriancaRepository children = mock(CriancaRepository.class);
    private final ProfissionalRepository professionals = mock(ProfissionalRepository.class);
    private final SessaoController controller = new SessaoController(
            sessions, children, professionals, mock(AuthorizationService.class));

    @Test
    void guardianCannotFindSessionByInternalObservation() {
        var child = new Crianca("Lia", LocalDate.of(2018, 4, 12), null, null, null, null);
        ReflectionTestUtils.setField(child, "id", 10L);
        when(children.findLinkedToGuardian(2L)).thenReturn(List.of(child));
        when(sessions.findByCriancaId(10L)).thenReturn(List.of(session()));

        assertThat(controller.list(auth(2L, TipoUsuario.RESPONSAVEL), null, null, null,
                null, "segredo-interno")).isEmpty();
    }

    @Test
    void authorProfessionalMaySearchOwnInternalObservation() {
        var professional = new Profissional(1L, "PROF000001");
        ReflectionTestUtils.setField(professional, "id", 20L);
        when(professionals.findByUsuarioId(1L)).thenReturn(Optional.of(professional));
        when(sessions.findByProfissionalId(20L)).thenReturn(List.of(session()));

        assertThat(controller.list(auth(1L, TipoUsuario.PROFISSIONAL), null, null, null,
                null, "segredo-interno")).hasSize(1);
    }

    private Sessao session() {
        return new Sessao(OffsetDateTime.now().plusDays(1), 45, TipoSessao.TERAPIA_INDIVIDUAL,
                "Conteúdo compartilhado", "segredo-interno", 10L, 20L);
    }

    private UsernamePasswordAuthenticationToken auth(Long id, TipoUsuario type) {
        return UsernamePasswordAuthenticationToken.authenticated(
                new AuthenticatedUser(id, "user@example.test", type), null, List.of());
    }
}
