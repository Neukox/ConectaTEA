package br.com.conectatea.vinculo.application;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.shared.domain.BusinessRuleException;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.*;
import br.com.conectatea.vinculo.infrastructure.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConviteNominalService {
    private static final SecureRandom RANDOM=new SecureRandom();
    private final ConviteCirculoRepository invites; private final VinculoResponsavelRepository guardians;
    private final VinculoProfissionalRepository professionalLinks; private final ProfissionalRepository professionals;
    private final UsuarioRepository users; private final CriancaRepository children; private final Clock clock;
    public ConviteNominalService(ConviteCirculoRepository invites,VinculoResponsavelRepository guardians,
            VinculoProfissionalRepository professionalLinks,ProfissionalRepository professionals,
            UsuarioRepository users,CriancaRepository children,Clock clock){this.invites=invites;this.guardians=guardians;this.professionalLinks=professionalLinks;this.professionals=professionals;this.users=users;this.children=children;this.clock=clock;}

    @Transactional
    public IssuedInvite issue(AuthenticatedUser actor,Long childId,String email,PapelCirculo role){
        if(role==PapelCirculo.RESPONSAVEL_GESTOR)throw new BusinessRuleException("FIRST_MANAGER_AUTHORITY_REQUIRED","O bootstrap do primeiro gestor exige verificação de autoridade ainda não definida");
        requireManager(actor,childId); var child=children.findById(childId).orElseThrow();
        if(child.isArquivada())throw new BusinessRuleException("CHILD_ARCHIVED","Criança arquivada não aceita convite");
        var recipient=users.findByEmailIgnoreCase(email.trim()).filter(u->u.isAtivo()).orElseThrow(()->new BusinessRuleException("INVITEE_NOT_ELIGIBLE","Destinatário precisa ter conta ativa"));
        var expected=role==PapelCirculo.PROFISSIONAL?TipoUsuario.PROFISSIONAL:TipoUsuario.RESPONSAVEL;
        if(recipient.getTipo()!=expected)throw new BusinessRuleException("INVITEE_ROLE_MISMATCH","Tipo da conta não corresponde ao papel convidado");
        if(invites.existsByCriancaIdAndDestinatarioUsuarioIdAndPapelAndStatus(childId,recipient.getId(),role,"PENDENTE_ACEITE"))throw new BusinessRuleException("INVITE_ALREADY_PENDING","Já existe convite pendente para este destinatário");
        var raw=token(); var now=Instant.now(clock);
        var invite=invites.save(new ConviteCirculo(childId,actor.id(),recipient.getId(),recipient.getEmail(),role,hash(raw),now.plus(7,ChronoUnit.DAYS),now));
        return new IssuedInvite(invite.getId(),childId,recipient.getEmail(),role,invite.getStatus(),invite.getExpiraEm(),raw);
    }

    @Transactional
    public InviteView accept(AuthenticatedUser actor,String raw){
        var now=Instant.now(clock); var invite=invites.findByHashForUpdate(hash(raw)).orElseThrow(()->new BusinessRuleException("INVITE_INVALID","Convite inválido"));
        if(!invite.utilizavelEm(now)){if("PENDENTE_ACEITE".equals(invite.getStatus()))invite.expirar();throw new BusinessRuleException("INVITE_UNAVAILABLE","Convite expirado, cancelado ou consumido");}
        if(!actor.id().equals(invite.getDestinatarioUsuarioId()))throw new AccessDeniedException("Convite destinado a outra conta");
        var user=users.findById(actor.id()).filter(u->u.isAtivo()).orElseThrow();
        if(!user.isEmailConfirmado()||!user.getEmail().equalsIgnoreCase(invite.getDestinatarioEmail()))throw new BusinessRuleException("EMAIL_NOT_CONFIRMED","O email destinatário precisa estar confirmado");
        var child=children.findById(invite.getCriancaId()).orElseThrow(); if(child.isArquivada())throw new BusinessRuleException("CHILD_ARCHIVED","Criança arquivada não aceita convite");
        requireManagerById(invite.getEmissorUsuarioId(),invite.getCriancaId());
        if(invite.getPapel()==PapelCirculo.PROFISSIONAL){var profile=professionals.findByUsuarioId(actor.id()).orElseThrow();var existing=professionalLinks.findByProfissionalIdAndCriancaId(profile.getId(),invite.getCriancaId());existing.ifPresentOrElse(VinculoProfissionalCrianca::vincular,()->professionalLinks.save(new VinculoProfissionalCrianca(profile.getId(),invite.getCriancaId())));}else{var existing=guardians.findByResponsavelIdAndCriancaId(actor.id(),invite.getCriancaId());existing.ifPresentOrElse(VinculoResponsavelCrianca::vincular,()->guardians.save(new VinculoResponsavelCrianca(actor.id(),invite.getCriancaId())));}
        invite.aceitar(now); return view(invite);
    }

    @Transactional public void cancel(AuthenticatedUser actor,Long childId,Long inviteId){requireManager(actor,childId);var invite=invites.findById(inviteId).orElseThrow();if(!invite.getCriancaId().equals(childId))throw new AccessDeniedException("Convite pertence a outra criança");try{invite.cancelar();}catch(IllegalStateException e){throw new BusinessRuleException("INVITE_UNAVAILABLE","Convite não está pendente");}}
    @Transactional(readOnly=true) public List<InviteView> listForChild(AuthenticatedUser actor,Long childId){requireManager(actor,childId);return invites.findAllByCriancaIdOrderByCreatedAtDesc(childId).stream().map(this::view).toList();}
    @Transactional(readOnly=true) public List<InviteView> mine(AuthenticatedUser actor){return invites.findAllByDestinatarioUsuarioIdOrderByCreatedAtDesc(actor.id()).stream().map(this::view).toList();}
    private void requireManager(AuthenticatedUser actor,Long childId){if(actor.tipo()!=TipoUsuario.RESPONSAVEL)throw new AccessDeniedException("Somente gestor emite convite");requireManagerById(actor.id(),childId);}
    private void requireManagerById(Long userId,Long childId){var active=guardians.lockActiveByChild(childId,StatusVinculo.VINCULADO);if(active.stream().noneMatch(v->v.getResponsavelId().equals(userId)&&v.isGestor()))throw new AccessDeniedException("Gestor emissor não está mais autorizado");}
    private InviteView view(ConviteCirculo i){return new InviteView(i.getId(),i.getCriancaId(),i.getDestinatarioEmail(),i.getPapel(),i.getStatus(),i.getExpiraEm(),i.getCreatedAt());}
    private String token(){var b=new byte[32];RANDOM.nextBytes(b);return Base64.getUrlEncoder().withoutPadding().encodeToString(b);} private String hash(String v){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(v.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
    public record IssuedInvite(Long id,Long criancaId,String destinatarioEmail,PapelCirculo papel,String status,Instant expiraEm,String token){}
    public record InviteView(Long id,Long criancaId,String destinatarioEmail,PapelCirculo papel,String status,Instant expiraEm,Instant criadoEm){}
}
