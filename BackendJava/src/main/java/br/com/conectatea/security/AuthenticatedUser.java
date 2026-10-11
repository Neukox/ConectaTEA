package br.com.conectatea.security;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.time.Instant;
public record AuthenticatedUser(Long id, String email, TipoUsuario tipo, Instant issuedAt, Long credentialsVersion) {
    public AuthenticatedUser(Long id,String email,TipoUsuario tipo){this(id,email,tipo,null,null);}
    public AuthenticatedUser(Long id,String email,TipoUsuario tipo,Instant issuedAt){this(id,email,tipo,issuedAt,null);}
}

