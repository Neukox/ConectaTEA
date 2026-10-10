package br.com.conectatea.emailverification.application;

import java.net.URI;

public record EmailVerificationRequestedEvent(Long userId, String name, String email, URI url) {}
