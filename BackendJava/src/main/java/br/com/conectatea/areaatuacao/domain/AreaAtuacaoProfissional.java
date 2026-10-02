package br.com.conectatea.areaatuacao.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "areas_atuacao_profissionais")
@IdClass(AreaAtuacaoProfissionalId.class)
public class AreaAtuacaoProfissional {
    @Id @Column(name = "profissional_id") private Long profissionalId;
    @Id @Column(name = "area_id") private Long areaId;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    protected AreaAtuacaoProfissional() {}
    public AreaAtuacaoProfissional(Long profissionalId, Long areaId) { this.profissionalId = profissionalId; this.areaId = areaId; this.createdAt = Instant.now(); }
    public Long getProfissionalId() { return profissionalId; }
    public Long getAreaId() { return areaId; }
}
