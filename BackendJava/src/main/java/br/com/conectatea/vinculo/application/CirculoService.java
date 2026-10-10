package br.com.conectatea.vinculo.application;

import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.shared.domain.BusinessRuleException;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.PapelCirculo;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CirculoService {
    private final VinculoResponsavelRepository guardians;
    private final VinculoProfissionalRepository professionalsLinks;
    private final ProfissionalRepository professionals;
    private final UsuarioRepository users;
    private final AuthorizationService authorization;

    public CirculoService(VinculoResponsavelRepository guardians,
            VinculoProfissionalRepository professionalsLinks,
            ProfissionalRepository professionals, UsuarioRepository users,
            AuthorizationService authorization) {
        this.guardians = guardians; this.professionalsLinks = professionalsLinks;
        this.professionals = professionals; this.users = users; this.authorization = authorization;
    }

    @Transactional(readOnly = true)
    public CircleResponse members(AuthenticatedUser actor, Long childId) {
        authorization.requireCrianca(actor, childId);
        var guardianLinks = guardians.findAllByCriancaIdAndStatus(childId, StatusVinculo.VINCULADO);
        var professionalLinks = professionalsLinks.findAllByCriancaIdAndStatus(childId, StatusVinculo.VINCULADO);
        var profiles = professionals.findAllById(professionalLinks.stream().map(item -> item.getProfissionalId()).toList());
        var profileById = profiles.stream().collect(Collectors.toMap(item -> item.getId(), Function.identity()));
        var userIds = new ArrayList<Long>();
        userIds.addAll(guardianLinks.stream().map(item -> item.getResponsavelId()).toList());
        userIds.addAll(profiles.stream().map(item -> item.getUsuarioId()).toList());
        var userById = users.findAllById(userIds).stream()
                .collect(Collectors.toMap(item -> item.getId(), Function.identity()));
        var actorManager = guardianLinks.stream().anyMatch(item ->
                item.getResponsavelId().equals(actor.id()) && item.isGestor());

        var result = new ArrayList<MemberResponse>();
        guardianLinks.forEach(link -> {
            var user = userById.get(link.getResponsavelId());
            result.add(new MemberResponse(link.getId(), user.getId(), user.getNome(),
                    link.getPapel(), "RESPONSAVEL",
                    new AllowedActions(actorManager && !user.getId().equals(actor.id()),
                            user.getId().equals(actor.id()), actorManager && !link.isGestor())));
        });
        professionalLinks.forEach(link -> {
            var profile = profileById.get(link.getProfissionalId());
            var user = userById.get(profile.getUsuarioId());
            result.add(new MemberResponse(link.getId(), user.getId(), user.getNome(),
                    PapelCirculo.PROFISSIONAL, "PROFISSIONAL",
                    new AllowedActions(actorManager, user.getId().equals(actor.id()), false)));
        });
        return new CircleResponse(childId, actorManager, result);
    }

    @Transactional
    public void transferManagement(AuthenticatedUser actor, Long childId, Long targetGuardianUserId) {
        if (actor.tipo() != TipoUsuario.RESPONSAVEL) throw new AccessDeniedException("Somente gestor pode transferir gestão");
        var active = guardians.lockActiveByChild(childId, StatusVinculo.VINCULADO);
        var current = active.stream().filter(item -> item.getResponsavelId().equals(actor.id())).findFirst()
                .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
        if (!current.isGestor()) throw new AccessDeniedException("Somente gestor pode transferir gestão");
        var target = active.stream().filter(item -> item.getResponsavelId().equals(targetGuardianUserId)).findFirst()
                .orElseThrow(() -> new BusinessRuleException("TARGET_NOT_ACTIVE", "Responsável de destino não possui vínculo ativo"));
        if (target.getPapel() == null) {
            throw new BusinessRuleException("LEGACY_ROLE_UNCLASSIFIED", "Vínculo legado precisa ser classificado antes da transferência");
        }
        target.tornarGestor();
        current.tornarResponsavel();
    }

    @Transactional
    public void leave(AuthenticatedUser actor, Long childId) {
        if (actor.tipo() == TipoUsuario.RESPONSAVEL) {
            var active = guardians.lockActiveByChild(childId, StatusVinculo.VINCULADO);
            var own = active.stream().filter(item -> item.getResponsavelId().equals(actor.id())).findFirst()
                    .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
            if (own.isGestor() && active.stream().filter(item -> item.isGestor()).count() <= 1) {
                throw new BusinessRuleException("LAST_MANAGER", "Transfira a gestão antes de sair");
            }
            own.desvincular();
            return;
        }
        var profile = professionals.findByUsuarioId(actor.id()).orElseThrow();
        var link = professionalsLinks.findByProfissionalIdAndCriancaIdAndStatus(
                profile.getId(), childId, StatusVinculo.VINCULADO)
                .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
        link.desvincular("SAIDA_VOLUNTARIA");
    }

    public record CircleResponse(Long criancaId, boolean gestorAtual, List<MemberResponse> membros) {}
    public record MemberResponse(Long vinculoId, Long usuarioId, String nome, PapelCirculo papel,
                                 String tipo, AllowedActions acoesPermitidas) {}
    public record AllowedActions(boolean podeRemover, boolean podeSair, boolean podeTransferirGestao) {}
}
