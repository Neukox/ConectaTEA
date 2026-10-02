package br.com.conectatea.localatendimento.api;

import br.com.conectatea.localatendimento.domain.LocalAtendimento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class LocalAtendimentoDtos {
    private LocalAtendimentoDtos() {}
    public record CreateRequest(@NotBlank @Size(max = 150) String nome, @NotBlank @Size(max = 120) String cidade) {}
    public record UpdateRequest(@NotBlank @Size(max = 150) String nome, @NotBlank @Size(max = 120) String cidade) {}
    public record Response(Long id, String nome, String cidade) {
        public static Response from(LocalAtendimento local) { return new Response(local.getId(), local.getNome(), local.getCidade()); }
    }
}
