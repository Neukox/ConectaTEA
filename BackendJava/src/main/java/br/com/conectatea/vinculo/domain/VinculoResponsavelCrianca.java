package br.com.conectatea.vinculo.domain;

import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
        name = "vinculos_responsaveis_criancas",
        uniqueConstraints = @UniqueConstraint(columnNames = {"responsavel_id", "crianca_id"}))
public class VinculoResponsavelCrianca extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "responsavel_id", nullable = false)
    private Long responsavelId;

    @Column(name = "crianca_id", nullable = false)
    private Long criancaId;

    private String parentesco;
    private boolean principal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusVinculo status;

    @Column(name = "data_vinculo")
    private Instant dataVinculo;

    @Column(name = "data_desvinculo")
    private Instant dataDesvinculo;

    protected VinculoResponsavelCrianca() {
    }

    public VinculoResponsavelCrianca(Long guardianId, Long childId) {
        responsavelId = guardianId;
        criancaId = childId;
        vincular();
    }

    public Long getResponsavelId() {
        return responsavelId;
    }

    public Long getCriancaId() {
        return criancaId;
    }

    public StatusVinculo getStatus() {
        return status;
    }

    public void vincular() {
        status = StatusVinculo.VINCULADO;
        dataVinculo = Instant.now();
        dataDesvinculo = null;
    }

    public void desvincular() {
        status = StatusVinculo.DESVINCULADO;
        dataDesvinculo = Instant.now();
    }
}
