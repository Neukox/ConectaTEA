package br.com.conectatea.emailverification.domain;

import br.com.conectatea.usuario.domain.Usuario;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false) private Usuario usuario;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64) private String tokenHash;
    @Column(name = "expira_em", nullable = false) private Instant expiraEm;
    @Column(name = "consumido_em") private Instant consumidoEm;
    @Column(name = "invalidado_em") private Instant invalidadoEm;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;

    protected EmailVerificationToken() {}
    public EmailVerificationToken(Usuario usuario, String tokenHash, Instant expiraEm, Instant createdAt) {
        this.usuario = usuario; this.tokenHash = tokenHash; this.expiraEm = expiraEm; this.createdAt = createdAt;
    }
    public Usuario getUsuario(){ return usuario; }
    public Instant getCreatedAt(){ return createdAt; }
    public boolean utilizavelEm(Instant now){ return consumidoEm == null && invalidadoEm == null && expiraEm.isAfter(now); }
    public void consumir(Instant now){ if (!utilizavelEm(now)) throw new IllegalStateException("Token indisponível"); consumidoEm = now; }
}
