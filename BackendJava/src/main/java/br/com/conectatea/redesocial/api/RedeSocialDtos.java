package br.com.conectatea.redesocial.api;

import br.com.conectatea.redesocial.domain.RedeSocial;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class RedeSocialDtos {
    private RedeSocialDtos() {}
    public record CreateRequest(@NotBlank @Size(max = 60) String tipo, @NotBlank @Size(max = 2048) @Pattern(regexp = "(?i)^https?://.+", message = "deve ser uma URL HTTP ou HTTPS") String url) {}
    public record UpdateRequest(@NotBlank @Size(max = 60) String tipo, @NotBlank @Size(max = 2048) @Pattern(regexp = "(?i)^https?://.+", message = "deve ser uma URL HTTP ou HTTPS") String url) {}
    public record Response(Long id, String tipo, String url) { public static Response from(RedeSocial rede) { return new Response(rede.getId(), rede.getTipo(), rede.getUrl()); } }
}
