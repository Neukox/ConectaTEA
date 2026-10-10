package br.com.conectatea.vinculo.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.shared.domain.BusinessRuleException;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.PapelCirculo;
import br.com.conectatea.vinculo.domain.HistoricoVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import br.com.conectatea.vinculo.infrastructure.HistoricoVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.SolicitacaoTokenVinculoRepository;
import java.time.Instant;
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
    private final CriancaRepository children;
    private final HistoricoVinculoRepository history;
    private final AuditLogService audits;
    private final SolicitacaoTokenVinculoRepository requests;

    public CirculoService(VinculoResponsavelRepository guardians,
            VinculoProfissionalRepository professionalsLinks,
            ProfissionalRepository professionals, UsuarioRepository users,
            AuthorizationService authorization, CriancaRepository children,
            HistoricoVinculoRepository history, AuditLogService audits,
            SolicitacaoTokenVinculoRepository requests) {
        this.guardians = guardians; this.professionalsLinks = professionalsLinks;
        this.professionals = professionals; this.users = users; this.authorization = authorization;
        this.children = children; this.history = history; this.audits = audits;
        this.requests = requests;
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
        var managerCount = guardianLinks.stream().filter(VinculoResponsavelCrianca::isGestor).count();

        var result = new ArrayList<MemberResponse>();
        guardianLinks.forEach(link -> {
            var user = userById.get(link.getResponsavelId());
            result.add(new MemberResponse(link.getId(), user.getId(), user.getNome(),
                    link.getPapel(), "RESPONSAVEL",
                    new AllowedActions(actorManager && !user.getId().equals(actor.id())
                                    && (!link.isGestor() || managerCount > 1),
                            user.getId().equals(actor.id()) && (!link.isGestor() || managerCount > 1),
                            user.getId().equals(actor.id()) && link.isGestor() && managerCount <= 1,
                            actorManager && !user.getId().equals(actor.id())
                                    && link.getPapel() == PapelCirculo.RESPONSAVEL)));
        });
        professionalLinks.forEach(link -> {
            var profile = profileById.get(link.getProfissionalId());
            var user = userById.get(profile.getUsuarioId());
            result.add(new MemberResponse(link.getId(), user.getId(), user.getNome(),
                    PapelCirculo.PROFISSIONAL, "PROFISSIONAL",
                    new AllowedActions(actorManager, user.getId().equals(actor.id()), false, false)));
        });
        return new CircleResponse(childId, actorManager, result);
    }

    @Transactional
    public void transferManagement(AuthenticatedUser actor, Long childId, Long targetGuardianUserId) {
        if (actor.tipo() != TipoUsuario.RESPONSAVEL) throw new AccessDeniedException("Somente gestor pode transferir gestão");
        requireActiveChild(childId);
        var active = guardians.lockActiveByChild(childId, StatusVinculo.VINCULADO);
        var current = active.stream().filter(item -> item.getResponsavelId().equals(actor.id())).findFirst()
                .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
        if (!current.isGestor()) throw new AccessDeniedException("Somente gestor pode transferir gestão");
        if (actor.id().equals(targetGuardianUserId)) {
            throw new BusinessRuleException("CANNOT_TRANSFER_TO_SELF", "Gestão deve ser transferida para outro responsável ativo");
        }
        var target = active.stream().filter(item -> item.getResponsavelId().equals(targetGuardianUserId)).findFirst()
                .orElseThrow(() -> new BusinessRuleException("TARGET_NOT_ACTIVE", "Responsável de destino não possui vínculo ativo"));
        if (target.getPapel() == null) {
            throw new BusinessRuleException("LEGACY_ROLE_UNCLASSIFIED", "Vínculo legado precisa ser classificado antes da transferência");
        }
        target.tornarGestor();
        current.tornarResponsavel();
        history.save(new HistoricoVinculo(childId, actor.id(), targetGuardianUserId, null,
                "GESTAO_TRANSFERIDA", "RESPONSAVEL_GESTOR", null));
        audits.record(actor.id(), "GESTAO_TRANSFERIDA", "VINCULO_RESPONSAVEL", target.getId(),
                childId, null, "SUCESSO", "destinatarioUsuarioId=" + targetGuardianUserId);
    }

    @Transactional
    public void leave(AuthenticatedUser actor, Long childId) {
        if (actor.tipo() == TipoUsuario.RESPONSAVEL) {
            leaveGuardian(actor.id(), childId, actor.id(), "SAIDA_VOLUNTARIA");
            return;
        }
        var profile = professionals.findByUsuarioId(actor.id()).orElseThrow();
        var link = professionalsLinks.findByProfissionalIdAndCriancaIdAndStatus(
                profile.getId(), childId, StatusVinculo.VINCULADO)
                .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
        link.desvincular("SAIDA_VOLUNTARIA");
        audits.record(actor.id(), "VINCULO_ENCERRADO", "VINCULO_PROFISSIONAL", link.getId(),
                childId, profile.getId(), "SUCESSO", "motivo=SAIDA_VOLUNTARIA");
    }

    @Transactional
    public void removeMember(AuthenticatedUser actor, Long childId, Long linkId, String type) {
        requireActiveChild(childId);
        var active = guardians.lockActiveByChild(childId, StatusVinculo.VINCULADO);
        var manager = active.stream().filter(item -> item.getResponsavelId().equals(actor.id())).findFirst()
                .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
        if (!manager.isGestor()) throw new AccessDeniedException("Somente gestor remove membros");
        if ("RESPONSAVEL".equals(type)) {
            var target = active.stream().filter(item -> item.getId().equals(linkId)).findFirst()
                    .orElseThrow(() -> new BusinessRuleException("MEMBER_NOT_ACTIVE", "Responsável não possui vínculo ativo"));
            if (target.getResponsavelId().equals(actor.id())) {
                throw new BusinessRuleException("USE_LEAVE_FLOW", "Gestor deve usar o fluxo de saída e transferência");
            }
            if (target.isGestor() && active.stream().filter(VinculoResponsavelCrianca::isGestor).count() <= 1) {
                throw new BusinessRuleException("LAST_MANAGER", "Transfira a gestão antes da remoção");
            }
            target.desvincular();
            recordRemoval(actor.id(), childId, target.getResponsavelId(), null, target.getId(), type);
            return;
        }
        if (!"PROFISSIONAL".equals(type)) throw new BusinessRuleException("INVALID_MEMBER_TYPE", "Tipo de membro inválido");
        var target = professionalsLinks.findByIdAndChildForUpdate(linkId, childId, StatusVinculo.VINCULADO)
                .orElseThrow(() -> new BusinessRuleException("MEMBER_NOT_ACTIVE", "Profissional não possui vínculo ativo"));
        target.desvincular("REMOVIDO_PELO_GESTOR");
        recordRemoval(actor.id(), childId, null, target.getProfissionalId(), target.getId(), type);
    }

    @Transactional
    public void deactivateGuardian(Long guardianUserId) {
        var ownLinks = guardians.findAllByResponsavelIdAndStatus(guardianUserId, StatusVinculo.VINCULADO);
        for (var ownSnapshot : ownLinks) {
            leaveGuardian(guardianUserId, ownSnapshot.getCriancaId(), guardianUserId, "CONTA_DESATIVADA");
        }
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> pendingRequests(AuthenticatedUser actor, Long childId) {
        requireManager(actor, childId);
        var pending = requests.findAllByCriancaIdAndStatusOrderById(childId, "PENDENTE");
        var requesterIds = pending.stream().map(item -> item.getSolicitanteUsuarioId()).distinct().toList();
        var requesterById = users.findAllById(requesterIds).stream()
                .collect(Collectors.toMap(item -> item.getId(), Function.identity()));
        return pending.stream().map(item -> {
            var requester = requesterById.get(item.getSolicitanteUsuarioId());
            return new RequestResponse(item.getId(), childId, item.getStatus(), item.getCreatedAt(),
                    requester == null ? null : requester.getId(), requester == null ? null : requester.getNome(),
                    requester == null ? null : requester.getEmail());
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<OwnRequestResponse> ownRequests(AuthenticatedUser actor) {
        if (actor.tipo() != TipoUsuario.RESPONSAVEL) throw new AccessDeniedException("Somente responsável possui solicitações");
        var own = requests.findAllBySolicitanteUsuarioIdOrderByIdDesc(actor.id());
        var childById = children.findAllById(own.stream().map(item -> item.getCriancaId()).distinct().toList())
                .stream().collect(Collectors.toMap(item -> item.getId(), Function.identity()));
        return own.stream().map(item -> new OwnRequestResponse(item.getId(), item.getCriancaId(),
                childById.containsKey(item.getCriancaId()) ? childById.get(item.getCriancaId()).getNome() : null,
                item.getStatus(), item.getCreatedAt(), item.getDecididaEm())).toList();
    }

    private void requireManager(AuthenticatedUser actor, Long childId) {
        if (actor.tipo() != TipoUsuario.RESPONSAVEL) throw new AccessDeniedException("Somente gestor acessa solicitações");
        requireActiveChild(childId);
        var active = guardians.findAllByCriancaIdAndStatus(childId, StatusVinculo.VINCULADO);
        if (active.stream().noneMatch(item -> item.getResponsavelId().equals(actor.id()) && item.isGestor())) {
            throw new AccessDeniedException("Somente gestor acessa solicitações");
        }
    }

    private void leaveGuardian(Long guardianId, Long childId, Long actorId, String reason) {
        var active = guardians.lockActiveByChild(childId, StatusVinculo.VINCULADO);
        var own = active.stream().filter(item -> item.getResponsavelId().equals(guardianId)).findFirst()
                .orElseThrow(() -> new AccessDeniedException("Sem vínculo ativo"));
        if (own.isGestor() && active.stream().filter(VinculoResponsavelCrianca::isGestor).count() <= 1) {
            throw new BusinessRuleException("LAST_MANAGER", "Transfira a gestão antes de sair");
        }
        own.desvincular();
        history.save(new HistoricoVinculo(childId, actorId, guardianId, null,
                "VINCULO_ENCERRADO", "DESVINCULADO", reason));
        audits.record(actorId, "VINCULO_ENCERRADO", "VINCULO_RESPONSAVEL", own.getId(),
                childId, null, "SUCESSO", "motivo=" + reason);
    }

    private void recordRemoval(Long actorId, Long childId, Long guardianId, Long professionalId,
                               Long linkId, String type) {
        history.save(new HistoricoVinculo(childId, actorId, guardianId, professionalId,
                "MEMBRO_REMOVIDO", "DESVINCULADO", "tipo=" + type));
        audits.record(actorId, "MEMBRO_REMOVIDO", "VINCULO_" + type, linkId,
                childId, professionalId, "SUCESSO", null);
    }

    private void requireActiveChild(Long childId) {
        var child = children.findById(childId).orElseThrow();
        if (child.isArquivada()) throw new BusinessRuleException("CHILD_ARCHIVED", "Criança arquivada não permite gestão do círculo");
    }

    public record CircleResponse(Long criancaId, boolean gestorAtual, List<MemberResponse> membros) {}
    public record MemberResponse(Long vinculoId, Long usuarioId, String nome, PapelCirculo papel,
                                 String tipo, AllowedActions acoesPermitidas) {}
    public record AllowedActions(boolean podeRemover, boolean podeSair,
                                 boolean requerTransferenciaGestao, boolean podeTransferirGestao) {}
    public record RequestResponse(Long solicitacaoId, Long criancaId, String status, Instant criadaEm,
                                  Long solicitanteUsuarioId, String solicitanteNome, String solicitanteEmail) {}
    public record OwnRequestResponse(Long solicitacaoId, Long criancaId, String criancaNome, String status,
                                     Instant criadaEm, Instant decididaEm) {}
}
