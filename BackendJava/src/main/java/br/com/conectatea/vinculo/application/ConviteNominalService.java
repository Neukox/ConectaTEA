package br.com.conectatea.vinculo.application;

import br.com.conectatea.auditoria.application.AuditLogService;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConviteNominalService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final ConviteCirculoRepository invites;
    private final VinculoResponsavelRepository guardians;
    private final VinculoProfissionalRepository professionalLinks;
    private final ProfissionalRepository professionals;
    private final UsuarioRepository users;
    private final CriancaRepository children;
    private final HistoricoVinculoRepository history;
    private final ConsentimentoRepository consents;
    private final AuditLogService audits;
    private final Clock clock;
    private final String consentVersion;
    private final String consentPurpose;

    public ConviteNominalService(ConviteCirculoRepository invites,
            VinculoResponsavelRepository guardians,
            VinculoProfissionalRepository professionalLinks,
            ProfissionalRepository professionals, UsuarioRepository users,
            CriancaRepository children, HistoricoVinculoRepository history,
            ConsentimentoRepository consents, AuditLogService audits, Clock clock,
            @Value("${app.consent.version:1.0}") String consentVersion,
            @Value("${app.consent.purpose:Acompanhamento terapêutico da criança}") String consentPurpose) {
        this.invites=invites; this.guardians=guardians; this.professionalLinks=professionalLinks;
        this.professionals=professionals; this.users=users; this.children=children;
        this.history=history; this.consents=consents; this.audits=audits; this.clock=clock;
        this.consentVersion=consentVersion; this.consentPurpose=consentPurpose;
    }

    @Transactional
    public IssuedInvite issue(AuthenticatedUser actor, Long childId, String email, PapelCirculo role) {
        if (role == PapelCirculo.RESPONSAVEL_GESTOR) throw new BusinessRuleException(
                "FIRST_MANAGER_AUTHORITY_REQUIRED",
                "O bootstrap do primeiro gestor exige verificação de autoridade ainda não definida");
        requireManagerForMutation(actor, childId);
        var child=children.findById(childId).orElseThrow();
        if(child.isArquivada()) throw new BusinessRuleException("CHILD_ARCHIVED","Criança arquivada não aceita convite");
        var recipient=users.findByEmailIgnoreCase(email.trim()).filter(u->u.isAtivo())
                .orElseThrow(()->new BusinessRuleException("INVITEE_NOT_ELIGIBLE","Destinatário precisa ter conta ativa"));
        var expected=role==PapelCirculo.PROFISSIONAL ? TipoUsuario.PROFISSIONAL : TipoUsuario.RESPONSAVEL;
        if(recipient.getTipo()!=expected) throw new BusinessRuleException("INVITEE_ROLE_MISMATCH","Tipo da conta não corresponde ao papel convidado");
        var now=Instant.now(clock);
        if(invites.existsPendingUsable(childId,recipient.getId(),role,now)) throw new BusinessRuleException("INVITE_ALREADY_PENDING","Já existe convite pendente para este destinatário");
        Long professionalId=role==PapelCirculo.PROFISSIONAL
                ? professionals.findByUsuarioId(recipient.getId()).orElseThrow(()->new BusinessRuleException("INVITEE_NOT_ELIGIBLE","Perfil profissional inexistente")).getId()
                : null;
        var raw=token();
        var invite=invites.save(new ConviteCirculo(childId,actor.id(),recipient.getId(),recipient.getEmail(),role,hash(raw),now.plus(7,ChronoUnit.DAYS),now));
        history.save(new HistoricoVinculo(childId,actor.id(),role==PapelCirculo.PROFISSIONAL?null:recipient.getId(),professionalId,"CONVITE_NOMINAL_EMITIDO","PENDENTE_ACEITE",role.name()));
        audit(actor.id(),"CONVITE_NOMINAL_EMITIDO",invite,professionalId,"papel="+role.name());
        return new IssuedInvite(invite.getId(),childId,recipient.getEmail(),role,invite.getStatus(),invite.getExpiraEm(),raw);
    }

    @Transactional
    public InviteView accept(AuthenticatedUser actor,String raw,String ip,String userAgent) {
        var now=Instant.now(clock);
        var invite=invites.findByHashForUpdate(hash(raw)).orElseThrow(()->new BusinessRuleException("INVITE_INVALID","Convite inválido"));
        if(!invite.utilizavelEm(now)) throw new BusinessRuleException("INVITE_UNAVAILABLE","Convite expirado, cancelado ou consumido");
        if(!actor.id().equals(invite.getDestinatarioUsuarioId())) throw new AccessDeniedException("Convite destinado a outra conta");
        var user=users.findById(actor.id()).filter(u->u.isAtivo()).orElseThrow();
        if(!user.isEmailConfirmado()||!user.getEmail().equalsIgnoreCase(invite.getDestinatarioEmail())) throw new BusinessRuleException("EMAIL_NOT_CONFIRMED","O email destinatário precisa estar confirmado");
        var child=children.findById(invite.getCriancaId()).orElseThrow();
        if(child.isArquivada()) throw new BusinessRuleException("CHILD_ARCHIVED","Criança arquivada não aceita convite");
        requireManagerByIdForMutation(invite.getEmissorUsuarioId(),invite.getCriancaId());

        Long professionalId=null;
        if(invite.getPapel()==PapelCirculo.PROFISSIONAL) {
            var profile=professionals.findByUsuarioId(actor.id()).orElseThrow();
            professionalId=profile.getId();
            var existing=professionalLinks.findByProfissionalIdAndCriancaId(profile.getId(),invite.getCriancaId());
            if(existing.filter(v->v.getStatus()==StatusVinculo.VINCULADO).isPresent()) throw new BusinessRuleException("ALREADY_LINKED","Destinatário já possui vínculo ativo");
            existing.ifPresentOrElse(VinculoProfissionalCrianca::vincular,
                    ()->professionalLinks.save(new VinculoProfissionalCrianca(profile.getId(),invite.getCriancaId())));
        } else {
            var existing=guardians.findByResponsavelIdAndCriancaId(actor.id(),invite.getCriancaId());
            if(existing.filter(v->v.getStatus()==StatusVinculo.VINCULADO).isPresent()) throw new BusinessRuleException("ALREADY_LINKED","Destinatário já possui vínculo ativo");
            existing.ifPresentOrElse(v->v.vincularComo(PapelCirculo.RESPONSAVEL),
                    ()->guardians.save(new VinculoResponsavelCrianca(actor.id(),invite.getCriancaId())));
            consents.save(new Consentimento(actor.id(),invite.getCriancaId(),null,ip,userAgent,consentVersion,consentPurpose));
        }
        history.save(new HistoricoVinculo(invite.getCriancaId(),actor.id(),invite.getPapel()==PapelCirculo.PROFISSIONAL?null:actor.id(),professionalId,"CONVITE_NOMINAL_ACEITO","VINCULADO",invite.getPapel().name()));
        invite.aceitar(now);
        audit(actor.id(),"CONVITE_NOMINAL_ACEITO",invite,professionalId,"papel="+invite.getPapel().name());
        return view(invite);
    }

    @Transactional
    public InviteView accept(AuthenticatedUser actor,String raw){return accept(actor,raw,null,null);}

    @Transactional
    public void cancel(AuthenticatedUser actor,Long childId,Long inviteId) {
        requireManagerForMutation(actor,childId);
        var invite=invites.findById(inviteId).orElseThrow();
        if(!invite.getCriancaId().equals(childId)) throw new AccessDeniedException("Convite pertence a outra criança");
        try{invite.cancelar();}catch(IllegalStateException e){throw new BusinessRuleException("INVITE_UNAVAILABLE","Convite não está pendente");}
        history.save(new HistoricoVinculo(childId,actor.id(),invite.getPapel()==PapelCirculo.PROFISSIONAL?null:invite.getDestinatarioUsuarioId(),null,"CONVITE_NOMINAL_CANCELADO","CANCELADO",invite.getPapel().name()));
        audit(actor.id(),"CONVITE_NOMINAL_CANCELADO",invite,null,"papel="+invite.getPapel().name());
    }

    @Transactional(readOnly=true)
    public List<InviteView> listForChild(AuthenticatedUser actor,Long childId) {
        requireManagerReadOnly(actor,childId);
        return invites.findAllByCriancaIdOrderByCreatedAtDesc(childId).stream().map(this::view).toList();
    }

    @Transactional(readOnly=true)
    public List<InviteView> mine(AuthenticatedUser actor) {
        return invites.findAllByDestinatarioUsuarioIdOrderByCreatedAtDesc(actor.id()).stream().map(this::view).toList();
    }

    private void requireManagerForMutation(AuthenticatedUser actor,Long childId) {
        if(actor.tipo()!=TipoUsuario.RESPONSAVEL) throw new AccessDeniedException("Somente gestor administra convites");
        requireManagerByIdForMutation(actor.id(),childId);
    }

    private void requireManagerByIdForMutation(Long userId,Long childId) {
        var active=guardians.lockActiveByChild(childId,StatusVinculo.VINCULADO);
        if(active.stream().noneMatch(v->v.getResponsavelId().equals(userId)&&v.isGestor())) throw new AccessDeniedException("Gestor emissor não está mais autorizado");
    }

    private void requireManagerReadOnly(AuthenticatedUser actor,Long childId) {
        if(actor.tipo()!=TipoUsuario.RESPONSAVEL || !guardians.existsByResponsavelIdAndCriancaIdAndStatusAndPapel(actor.id(),childId,StatusVinculo.VINCULADO,PapelCirculo.RESPONSAVEL_GESTOR)) throw new AccessDeniedException("Somente gestor consulta convites da criança");
    }

    private InviteView view(ConviteCirculo invite) {
        return new InviteView(invite.getId(),invite.getCriancaId(),invite.getDestinatarioEmail(),invite.getPapel(),invite.statusEm(Instant.now(clock)),invite.getExpiraEm(),invite.getCreatedAt());
    }

    private void audit(Long actor,String event,ConviteCirculo invite,Long professionalId,String metadata) {
        audits.record(actor,event,"CONVITE_CIRCULO",invite.getId(),invite.getCriancaId(),professionalId,"SUCESSO",metadata);
    }

    private String token(){var bytes=new byte[32];RANDOM.nextBytes(bytes);return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);}
    private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
    public record IssuedInvite(Long id,Long criancaId,String destinatarioEmail,PapelCirculo papel,String status,Instant expiraEm,String token){}
    public record InviteView(Long id,Long criancaId,String destinatarioEmail,PapelCirculo papel,String status,Instant expiraEm,Instant criadoEm){}
}
