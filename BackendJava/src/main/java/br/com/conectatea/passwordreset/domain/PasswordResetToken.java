package br.com.conectatea.passwordreset.domain;

import br.com.conectatea.usuario.domain.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
    @Column(name = "used_at")
    private Instant usedAt;
    @Column(name = "invalidated_at")
    private Instant invalidatedAt;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PasswordResetToken() {}

    public PasswordResetToken(Usuario usuario, String tokenHash, Instant expiresAt, Instant createdAt) {
        this.usuario = usuario;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public Long getId(){return id;}
    public Usuario getUsuario(){return usuario;}
    public String getTokenHash(){return tokenHash;}
    public Instant getExpiresAt(){return expiresAt;}
    public Instant getUsedAt(){return usedAt;}
    public Instant getInvalidatedAt(){return invalidatedAt;}
    public boolean isUsableAt(Instant now){return usedAt==null&&invalidatedAt==null&&expiresAt.isAfter(now);}
    public void consume(Instant now){if(!isUsableAt(now))throw new IllegalStateException("Token indisponível");usedAt=now;}
}
