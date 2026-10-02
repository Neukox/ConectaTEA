package br.com.conectatea.auditoria.domain;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="audit_logs")
public class AuditLog {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="usuario_id") private Long usuarioId; @Column(nullable=false,length=50) private String acao;
 @Column(nullable=false,length=80) private String evento; @Column(length=80) private String recurso;
 @Column(name="recurso_id") private Long recursoId; @Column(name="crianca_id") private Long criancaId;
 @Column(name="profissional_id") private Long profissionalId; @Column(length=64) private String ip;
 @Column(name="user_agent",length=500) private String userAgent; @Column(nullable=false,length=30) private String resultado;
 @Column(length=1000) private String metadados; @Column(name="created_at",nullable=false) private Instant createdAt;
 protected AuditLog(){}
 public AuditLog(Long actor,String event,String resource,Long resourceId,Long childId,Long professionalId,String ip,String agent,String result,String metadata){usuarioId=actor;acao=event;evento=event;recurso=resource;this.recursoId=resourceId;criancaId=childId;profissionalId=professionalId;this.ip=cut(ip,64);userAgent=cut(agent,500);resultado=result;metadados=cut(metadata,1000);createdAt=Instant.now();}
 private static String cut(String value,int max){return value==null||value.length()<=max?value:value.substring(0,max);}
}
