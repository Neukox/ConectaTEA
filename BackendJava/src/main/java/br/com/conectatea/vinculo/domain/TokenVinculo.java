package br.com.conectatea.vinculo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;

@Entity
@Table(name = "tokens_vinculo")
public class TokenVinculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_hash", nullable = false, unique = true, length = 64)
    private String codigoHash;

    @Column(name = "crianca_id", nullable = false)
    private Long criancaId;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusToken status = StatusToken.PENDENTE;

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    @Column(name = "usado_em")
    private Instant usadoEm;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Version
    private long version;

    protected TokenVinculo() {
    }

    public TokenVinculo(String hash, Long childId, Long professionalId, Instant expiresAt) {
        codigoHash = hash;
        criancaId = childId;
        profissionalId = professionalId;
        expiraEm = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCriancaId() {
        return criancaId;
    }

    public Long getProfissionalId() {
        return profissionalId;
    }

    public StatusToken getStatus() {
        return status;
    }

    public Instant getExpiraEm() {
        return expiraEm;
    }

    public void consumir(Instant now) {
        if (status != StatusToken.PENDENTE || !expiraEm.isAfter(now)) {
            throw new IllegalStateException("Token indisponível");
        }
        status = StatusToken.USADO;
        usadoEm = now;
    }

    public void expirar() {
        if (status == StatusToken.PENDENTE) {
            status = StatusToken.EXPIRADO;
        }
    }

    public void cancelar() {
        if (status != StatusToken.PENDENTE) {
            throw new IllegalStateException("Somente token pendente pode ser cancelado");
        }
        status = StatusToken.CANCELADO;
    }
}
