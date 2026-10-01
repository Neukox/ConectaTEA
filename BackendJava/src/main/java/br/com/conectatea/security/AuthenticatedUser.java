package br.com.conectatea.security;
import br.com.conectatea.usuario.domain.TipoUsuario;
public record AuthenticatedUser(Long id, String email, TipoUsuario tipo) {}

