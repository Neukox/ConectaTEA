package br.com.conectatea.vinculo.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="convites_circulo")
public class ConviteCirculo {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="crianca_id",nullable=false) private Long criancaId;
    @Column(name="emissor_usuario_id",nullable=false) private Long emissorUsuarioId;
    @Column(name="destinatario_usuario_id") private Long destinatarioUsuarioId;
    @Column(name="destinatario_email",length=255) private String destinatarioEmail;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private PapelCirculo papel;
    @Column(nullable=false,length=30) private String tipo;
    @Column(nullable=false,length=30) private String status;
    @Column(name="codigo_hash",nullable=false,unique=true,length=64) private String codigoHash;
    @Column(name="aprovado_por_usuario_id") private Long aprovadoPorUsuarioId;
    @Column(name="aprovado_em") private Instant aprovadoEm;
    @Column(name="expira_em",nullable=false) private Instant expiraEm;
    @Column(name="consumido_em") private Instant consumidoEm;
    @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
    @Version private long version;
    protected ConviteCirculo(){}
    public ConviteCirculo(Long child,Long issuer,Long recipient,String email,PapelCirculo role,String hash,Instant expires,Instant now){criancaId=child;emissorUsuarioId=issuer;destinatarioUsuarioId=recipient;destinatarioEmail=email;papel=role;tipo="NOMINAL_GESTOR";status="PENDENTE_ACEITE";codigoHash=hash;aprovadoPorUsuarioId=issuer;aprovadoEm=now;expiraEm=expires;createdAt=now;}
    public Long getId(){return id;} public Long getCriancaId(){return criancaId;} public Long getEmissorUsuarioId(){return emissorUsuarioId;} public Long getDestinatarioUsuarioId(){return destinatarioUsuarioId;} public String getDestinatarioEmail(){return destinatarioEmail;} public PapelCirculo getPapel(){return papel;} public String getStatus(){return status;} public Instant getExpiraEm(){return expiraEm;} public Instant getCreatedAt(){return createdAt;}
    public boolean utilizavelEm(Instant now){return "PENDENTE_ACEITE".equals(status)&&consumidoEm==null&&expiraEm.isAfter(now);}
    public String statusEm(Instant now){return "PENDENTE_ACEITE".equals(status)&&!expiraEm.isAfter(now)?"EXPIRADO":status;}
    public void aceitar(Instant now){if(!utilizavelEm(now))throw new IllegalStateException("Convite indisponível");status="ACEITO";consumidoEm=now;}
    public void cancelar(){if(!"PENDENTE_ACEITE".equals(status))throw new IllegalStateException("Convite indisponível");status="CANCELADO";}
    public void expirar(){if("PENDENTE_ACEITE".equals(status))status="EXPIRADO";}
}
