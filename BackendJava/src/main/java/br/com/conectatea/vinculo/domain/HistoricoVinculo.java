package br.com.conectatea.vinculo.domain;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="historico_vinculos") public class HistoricoVinculo {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(name="crianca_id",nullable=false) private Long criancaId;
 @Column(name="ator_usuario_id") private Long atorUsuarioId; @Column(name="responsavel_id") private Long responsavelId;
 @Column(name="profissional_id") private Long profissionalId; @Column(nullable=false,length=50) private String evento;
 @Column(length=30) private String status; @Column(length=255) private String motivo; @Column(columnDefinition="text") private String detalhes;
 @Column(name="created_at",nullable=false) private Instant createdAt;
 protected HistoricoVinculo(){} public HistoricoVinculo(Long child,Long actor,Long guardian,Long professional,String event,String status,String reason){criancaId=child;atorUsuarioId=actor;responsavelId=guardian;profissionalId=professional;evento=event;this.status=status;motivo=reason;createdAt=Instant.now();}
}
