package br.com.conectatea.vinculo.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.application.ProfileImageUrlResolver;
import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.dashboard.application.FeedService;
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
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
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
    private final ProfissionalRepository professionals = mock(ProfissionalRepository.class);
    private final UsuarioRepository users = mock(UsuarioRepository.class);
    private final FeedService feed = mock(FeedService.class);
    private final SolicitacaoTokenVinculoRepository requests = mock(SolicitacaoTokenVinculoRepository.class);
    private final ProfileImageUrlResolver profileImageUrls = mock(ProfileImageUrlResolver.class);
    private final CirculoService service = new CirculoService(guardians,
            professionalLinks, professionals,
            users, mock(AuthorizationService.class), children,
            mock(HistoricoVinculoRepository.class), mock(AuditLogService.class),
            requests, feed, profileImageUrls);

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
        verify(feed).registrarGestores(10L,1L,"GESTAO_TRANSFERIDA","VINCULO_RESPONSAVEL",
                target.getId(),"Gestão transferida","A gestão da criança foi transferida.");
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
    void professionalAccountDeactivationEndsEveryActiveLink() {
        var profile = professional(31L, 3L, null, null);
        var first = professionalLink(201L, 31L, 10L);
        var second = professionalLink(202L, 31L, 11L);
        when(professionals.findByUsuarioId(3L)).thenReturn(Optional.of(profile));
        when(professionalLinks.findAllByProfissionalIdAndStatus(31L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(first, second));

        service.deactivateProfessional(3L);

        assertThat(first.getStatus()).isEqualTo(StatusVinculo.DESVINCULADO);
        assertThat(second.getStatus()).isEqualTo(StatusVinculo.DESVINCULADO);
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

    @Test
    void composesOnlyActiveMembersWithOptionalProfileDataAndStableOrder() {
        var manager = guardian(1L, true, "Mãe", 101L);
        var common = guardian(2L, false, null, 102L);
        var managerUser = account(1L, "Zélia", TipoUsuario.RESPONSAVEL);
        var commonUser = account(2L, "Ana", TipoUsuario.RESPONSAVEL);
        var psychologistUser = account(3L, "Bruna", TipoUsuario.PROFISSIONAL);
        var therapistUser = account(4L, "Ana", TipoUsuario.PROFISSIONAL);
        var psychologist = professional(31L, 3L, "Psicologia", "profile-image:bruna.png");
        var therapist = professional(32L, 4L, null, null);
        var psychologistLink = professionalLink(201L, 31L, 10L);
        var therapistLink = professionalLink(202L, 32L, 10L);

        when(guardians.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(common, manager));
        when(professionalLinks.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(psychologistLink, therapistLink));
        when(professionals.findAllById(List.of(31L, 32L))).thenReturn(List.of(psychologist, therapist));
        when(users.findAllById(List.of(2L, 1L, 3L, 4L)))
                .thenReturn(List.of(managerUser, commonUser, psychologistUser, therapistUser));
        when(profileImageUrls.resolve("profile-image:bruna.png"))
                .thenReturn("https://api.example.test/api/profissionais/fotos/bruna.png");

        var response = service.members(user(1L), 10L);

        assertThat(response.criancaId()).isEqualTo(10L);
        assertThat(response.gestorAtual()).isTrue();
        assertThat(response.membros()).extracting(CirculoService.MemberResponse::nome)
                .containsExactly("Zélia", "Ana", "Ana", "Bruna");
        assertThat(response.membros()).extracting(CirculoService.MemberResponse::papel)
                .containsExactly(PapelCirculo.RESPONSAVEL_GESTOR, PapelCirculo.RESPONSAVEL,
                        PapelCirculo.PROFISSIONAL, PapelCirculo.PROFISSIONAL);
        assertThat(response.membros().get(0).parentesco()).isEqualTo("Mãe");
        assertThat(response.membros().get(2).especialidade()).isNull();
        assertThat(response.membros().get(2).fotoPerfilUrl()).isNull();
        assertThat(response.membros().get(3).especialidade()).isEqualTo("Psicologia");
        assertThat(response.membros().get(3).fotoPerfilUrl())
                .isEqualTo("https://api.example.test/api/profissionais/fotos/bruna.png");
        assertThat(response.membros().get(1).acoesPermitidas().podeRemover()).isTrue();
        assertThat(response.membros().get(2).acoesPermitidas().podeRemover()).isTrue();
        verifyNoInteractions(requests);
    }

    @Test
    void commonGuardianAndProfessionalCannotManageAndCanOnlyLeaveTheirOwnLink() {
        var manager = guardian(1L, true, null, 101L);
        var common = guardian(2L, false, null, 102L);
        var professional = professional(31L, 3L, null, null);
        var professionalLink = professionalLink(201L, 31L, 10L);
        when(guardians.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(manager, common));
        when(professionalLinks.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(professionalLink));
        when(professionals.findAllById(List.of(31L))).thenReturn(List.of(professional));
        when(users.findAllById(List.of(1L, 2L, 3L))).thenReturn(List.of(
                account(1L, "Gestor", TipoUsuario.RESPONSAVEL),
                account(2L, "Comum", TipoUsuario.RESPONSAVEL),
                account(3L, "Profissional", TipoUsuario.PROFISSIONAL)));

        var commonView = service.members(user(2L), 10L).membros();
        assertThat(commonView).allSatisfy(member -> assertThat(member.acoesPermitidas().podeRemover()).isFalse());
        assertThat(commonView).filteredOn(member -> member.usuarioId().equals(2L)).singleElement()
                .satisfies(member -> assertThat(member.acoesPermitidas().podeSair()).isTrue());

        var professionalView = service.members(
                new AuthenticatedUser(3L, "pro@example.test", TipoUsuario.PROFISSIONAL), 10L).membros();
        assertThat(professionalView).allSatisfy(member -> assertThat(member.acoesPermitidas().podeRemover()).isFalse());
        assertThat(professionalView).filteredOn(member -> member.usuarioId().equals(3L)).singleElement()
                .satisfies(member -> assertThat(member.acoesPermitidas().podeSair()).isTrue());
    }

    @Test
    void legacyRoleIsExposedAsCommonGuardianWithoutManagementPrivilege() {
        var legacy = guardian(2L, false, null, 102L);
        ReflectionTestUtils.setField(legacy, "papel", null);
        when(guardians.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO)).thenReturn(List.of(legacy));
        when(professionalLinks.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO)).thenReturn(List.of());
        when(users.findAllById(List.of(2L))).thenReturn(List.of(account(2L, "Legado", TipoUsuario.RESPONSAVEL)));

        var response = service.members(user(2L), 10L);

        assertThat(response.gestorAtual()).isFalse();
        assertThat(response.membros()).singleElement().satisfies(member -> {
            assertThat(member.papel()).isEqualTo(PapelCirculo.RESPONSAVEL);
            assertThat(member.acoesPermitidas().podeRemover()).isFalse();
        });
    }

    @Test
    void omitsInconsistentProfessionalLinksWithoutInventingMemberData() {
        var manager = guardian(1L, true, null, 101L);
        var missingProfileLink = professionalLink(201L, 31L, 10L);
        var missingUserProfile = professional(32L, 99L, "Psicologia", null);
        var missingUserLink = professionalLink(202L, 32L, 10L);
        when(guardians.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(manager));
        when(professionalLinks.findAllByCriancaIdAndStatus(10L, StatusVinculo.VINCULADO))
                .thenReturn(List.of(missingProfileLink, missingUserLink));
        when(professionals.findAllById(List.of(31L, 32L))).thenReturn(List.of(missingUserProfile));
        when(users.findAllById(List.of(1L, 99L)))
                .thenReturn(List.of(account(1L, "Gestor", TipoUsuario.RESPONSAVEL)));

        var response = service.members(user(1L), 10L);

        assertThat(response.membros()).singleElement()
                .extracting(CirculoService.MemberResponse::usuarioId).isEqualTo(1L);
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

    private VinculoResponsavelCrianca guardian(Long userId, boolean manager, String relationship, Long id) {
        var link = guardian(userId, manager);
        link.informarParentesco(relationship);
        ReflectionTestUtils.setField(link, "id", id);
        return link;
    }

    private Usuario account(Long id, String name, TipoUsuario type) {
        var account = new Usuario(name, name.toLowerCase() + "@example.test", "hash", null, null, type);
        ReflectionTestUtils.setField(account, "id", id);
        return account;
    }

    private Profissional professional(Long id, Long userId, String specialty, String photo) {
        var profile = new Profissional(userId, "PROF-" + id);
        profile.update(specialty, null, null, null, null, photo);
        ReflectionTestUtils.setField(profile, "id", id);
        return profile;
    }

    private VinculoProfissionalCrianca professionalLink(Long id, Long professionalId, Long childId) {
        var link = new VinculoProfissionalCrianca(professionalId, childId);
        ReflectionTestUtils.setField(link, "id", id);
        return link;
    }

    private AuthenticatedUser user(Long id) {
        return new AuthenticatedUser(id, "user@example.test", TipoUsuario.RESPONSAVEL);
    }
}
