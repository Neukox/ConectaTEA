package br.com.conectatea.notificacao.application;

import br.com.conectatea.usuario.domain.TipoUsuario;

public record NotificationRecipient(Long usuarioId, String nome, String email, TipoUsuario tipo) {
}
