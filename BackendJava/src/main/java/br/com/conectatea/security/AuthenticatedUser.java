package br.com.conectatea.security;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.time.Instant;
public record AuthenticatedUser(Long id, String email, TipoUsuario tipo, Instant issuedAt) {
    public AuthenticatedUser(Long id,String email,TipoUsuario tipo){this(id,email,tipo,null);}
}

