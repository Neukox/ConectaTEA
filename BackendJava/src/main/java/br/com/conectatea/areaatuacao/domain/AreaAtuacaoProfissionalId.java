package br.com.conectatea.areaatuacao.domain;

import java.io.Serializable;
import java.util.Objects;

public class AreaAtuacaoProfissionalId implements Serializable {
    private Long profissionalId;
    private Long areaId;
    public AreaAtuacaoProfissionalId() {}
    public AreaAtuacaoProfissionalId(Long profissionalId, Long areaId) { this.profissionalId = profissionalId; this.areaId = areaId; }
    @Override public boolean equals(Object other) { return other instanceof AreaAtuacaoProfissionalId id && Objects.equals(profissionalId, id.profissionalId) && Objects.equals(areaId, id.areaId); }
    @Override public int hashCode() { return Objects.hash(profissionalId, areaId); }
}
