package br.com.conectatea.areaatuacao.api;

import br.com.conectatea.areaatuacao.domain.AreaAtuacao;
import jakarta.validation.constraints.NotNull;

public final class AreaAtuacaoDtos {
    private AreaAtuacaoDtos() {}
    public record LinkRequest(@NotNull Long areaId) {}
    public record Response(Long id, String nome) { public static Response from(AreaAtuacao area) { return new Response(area.getId(), area.getNome()); } }
}
