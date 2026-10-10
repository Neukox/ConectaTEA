package br.com.conectatea.vinculo.domain;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="pedidos_primeiro_gestor")
public class PedidoPrimeiroGestor {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(name="crianca_id",nullable=false) private Long criancaId; @Column(name="solicitante_usuario_id",nullable=false) private Long solicitanteUsuarioId;
 @Column(name="vinculo_declarado",nullable=false) private String vinculoDeclarado; @Column(name="responsavel_legal_declarado",nullable=false) private boolean responsavelLegalDeclarado;
 @Column(nullable=false) private String status="PENDENTE"; @Column(name="operador_usuario_id") private Long operadorUsuarioId; @Column(name="referencia_verificacao") private String referenciaVerificacao; @Column(name="motivo_decisao") private String motivoDecisao;
 @Column(name="criado_em",nullable=false) private Instant criadoEm=Instant.now(); @Column(name="decidido_em") private Instant decididoEm;
 protected PedidoPrimeiroGestor(){} public PedidoPrimeiroGestor(Long c,Long u,String v){criancaId=c;solicitanteUsuarioId=u;vinculoDeclarado=v;responsavelLegalDeclarado=true;}
 public void decidir(boolean aprovado,Long operador,String referencia,String motivo,Instant quando){status=aprovado?"APROVADO":"RECUSADO";operadorUsuarioId=operador;referenciaVerificacao=referencia;motivoDecisao=motivo;decididoEm=quando;}
 public Long getId(){return id;} public Long getCriancaId(){return criancaId;} public Long getSolicitanteUsuarioId(){return solicitanteUsuarioId;} public String getVinculoDeclarado(){return vinculoDeclarado;} public String getStatus(){return status;} public Instant getCriadoEm(){return criadoEm;} public Long getOperadorUsuarioId(){return operadorUsuarioId;} public String getReferenciaVerificacao(){return referenciaVerificacao;} public String getMotivoDecisao(){return motivoDecisao;} public Instant getDecididoEm(){return decididoEm;}
}
