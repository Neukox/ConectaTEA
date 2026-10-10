package br.com.conectatea.vinculo.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.shared.domain.BusinessRuleException;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.PapelCirculo;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import br.com.conectatea.vinculo.infrastructure.HistoricoVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.SolicitacaoTokenVinculoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

class CirculoServiceTest {
    private final VinculoResponsavelRepository guardians = mock(VinculoResponsavelRepository.class);
    private final CriancaRepository children = mock(CriancaRepository.class);
    private final VinculoProfissionalRepository professionalLinks = mock(VinculoProfissionalRepository.class);
    private final UsuarioRepository users = mock(UsuarioRepository.class);
    private final CirculoService service = new CirculoService(guardians,
            professionalLinks, mock(ProfissionalRepository.class),
            users, mock(AuthorizationService.class), children,
            mock(HistoricoVinculoRepository.class), mock(AuditLogService.class),
            mock(SolicitacaoTokenVinculoRepository.class));

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
    void lastManagerActionsRequireTransferInsteadOfAdvertisingImmediateLeave() {
        var manager = guardian(1L, true);
        var account = new Usuario("Gestor", "gestor@example.test", "hash", null, null,
                TipoUsuario.RESPONSAVEL);
        ReflectionTestUtils.setField(account, "id", 1L);
        when(guardians.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(manager));
        when(professionalLinks.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of());
        when(users.findAllById(List.of(1L))).thenReturn(List.of(account));

        var member = service.members(user(1L), 10L).membros().getFirst();

        assertThat(member.acoesPermitidas().podeSair()).isFalse();
        assertThat(member.acoesPermitidas().requerTransferenciaGestao()).isTrue();
    }

    @Test
    void transferIsAtomicDomainOperationAndAllowsFormerManagerToLeaveLater() {
        var current = guardian(1L, true);
        var target = guardian(2L, false);
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(current, target));
        activeChild();

        service.transferManagement(user(1L), 10L, 2L);

        assertThat(current.getPapel()).isEqualTo(PapelCirculo.RESPONSAVEL);
        assertThat(target.getPapel()).isEqualTo(PapelCirculo.RESPONSAVEL_GESTOR);
    }

    @Test
    void transferToSelfIsRejectedWithoutChangingManager() {
        var current = guardian(1L, true);
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO)).thenReturn(List.of(current));
        activeChild();

        assertThatThrownBy(() -> service.transferManagement(user(1L), 10L, 1L))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("CANNOT_TRANSFER_TO_SELF");
        assertThat(current.isGestor()).isTrue();
    }

    @Test
    void commonGuardianCanLeaveAndLegacyRouteUsesSameRule() {
        var manager = guardian(1L, true);
        var common = guardian(2L, false);
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(manager, common));

        service.leave(user(2L), 10L);

        assertThat(common.getStatus()).isEqualTo(StatusVinculo.DESVINCULADO);
        assertThat(manager.isGestor()).isTrue();
    }

    @Test
    void accountDeactivationCannotRemoveTheLastManager() {
        var manager = guardian(1L, true);
        when(guardians.findAllByResponsavelIdAndStatus(1L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(manager));
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(manager));

        assertThatThrownBy(() -> service.deactivateGuardian(1L))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("LAST_MANAGER");
        assertThat(manager.getStatus()).isEqualTo(StatusVinculo.VINCULADO);
        assertThat(manager.isGestor()).isTrue();
    }

    @Test
    void transferRejectsUnlinkedAndLegacyTarget() {
        var current = guardian(1L, true);
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO)).thenReturn(List.of(current));
        activeChild();
        assertThatThrownBy(() -> service.transferManagement(user(1L), 10L, 99L))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("TARGET_NOT_ACTIVE");

        var legacy = guardian(2L, false);
        ReflectionTestUtils.setField(legacy, "papel", null);
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO)).thenReturn(List.of(current, legacy));
        assertThatThrownBy(() -> service.transferManagement(user(1L), 10L, 2L))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("LEGACY_ROLE_UNCLASSIFIED");
        assertThat(current.isGestor()).isTrue();
    }

    @Test
    void archivedChildAndUserWithoutAuthorityCannotTransfer() {
        var archived = new Crianca("Criança", LocalDate.of(2018, 1, 1), null, null, null, null);
        archived.arquivar();
        when(children.findById(10L)).thenReturn(Optional.of(archived));
        assertThatThrownBy(() -> service.transferManagement(user(1L), 10L, 2L))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("CHILD_ARCHIVED");

        activeChild();
        when(guardians.lockActiveByChild(10L, StatusVinculo.VINCULADO)).thenReturn(List.of(guardian(2L, true)));
        assertThatThrownBy(() -> service.transferManagement(user(1L), 10L, 2L))
                .isInstanceOf(AccessDeniedException.class);
    }

    private void activeChild() {
        when(children.findById(10L)).thenReturn(Optional.of(new Crianca(
                "Criança", LocalDate.of(2018, 1, 1), null, null, null, null)));
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
