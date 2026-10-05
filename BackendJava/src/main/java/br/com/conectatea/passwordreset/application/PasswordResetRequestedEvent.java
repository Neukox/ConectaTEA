package br.com.conectatea.passwordreset.application;

import java.net.URI;

public final class PasswordResetRequestedEvent {
    private final Long userId;
    private final String recipientEmail;
    private final URI resetUrl;

    public PasswordResetRequestedEvent(Long userId,String recipientEmail, URI resetUrl) {
        this.userId=userId;
        this.recipientEmail=recipientEmail;
        this.resetUrl=resetUrl;
    }

    public Long userId(){return userId;}
    public String recipientEmail(){return recipientEmail;}
    public URI resetUrl(){return resetUrl;}
}
