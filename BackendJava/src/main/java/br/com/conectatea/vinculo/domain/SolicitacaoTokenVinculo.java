package br.com.conectatea.vinculo.domain;

import br.com.conectatea.shared.domain.BusinessRuleException;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "solicitacoes_token_vinculo",
       uniqueConstraints = @UniqueConstraint(columnNames = {"token_id", "solicitante_usuario_id"}))
public class SolicitacaoTokenVinculo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name="token_id", nullable=false) private Long tokenId;
    @Column(name="crianca_id", nullable=false) private Long criancaId;
    @Column(name="solicitante_usuario_id", nullable=false) private Long solicitanteUsuarioId;
    @Column(nullable=false) private String status = "PENDENTE";
    private String ip;
    @Column(name="user_agent") private String userAgent;
    @Column(name="decidida_por_usuario_id") private Long decididaPorUsuarioId;
    @Column(name="decidida_em") private Instant decididaEm;
    @Column(name="created_at", nullable=false) private Instant createdAt = Instant.now();
    @Version private long version;
    protected SolicitacaoTokenVinculo() {}
    public SolicitacaoTokenVinculo(Long tokenId, Long criancaId, Long userId, String ip, String agent) {
        this.tokenId=tokenId; this.criancaId=criancaId; this.solicitanteUsuarioId=userId;
        this.ip=ip; this.userAgent=agent;
    }
    public Long getId(){return id;} public Long getTokenId(){return tokenId;}
    public Long getCriancaId(){return criancaId;} public Long getSolicitanteUsuarioId(){return solicitanteUsuarioId;}
    public String getStatus(){return status;} public String getIp(){return ip;} public String getUserAgent(){return userAgent;}
    public Long getDecididaPorUsuarioId(){return decididaPorUsuarioId;} public Instant getDecididaEm(){return decididaEm;}
    public Instant getCreatedAt(){return createdAt;}
    public void approve(Long managerId){if(!status.equals("PENDENTE"))throw new BusinessRuleException("REQUEST_ALREADY_DECIDED","Solicitação já decidida");status="APROVADA";decididaPorUsuarioId=managerId;decididaEm=Instant.now();}
    public void reject(Long managerId){if(!status.equals("PENDENTE"))throw new BusinessRuleException("REQUEST_ALREADY_DECIDED","Solicitação já decidida");status="RECUSADA";decididaPorUsuarioId=managerId;decididaEm=Instant.now();}
}
