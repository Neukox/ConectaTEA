package br.com.conectatea.redesocial.domain;

import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "redes_sociais", uniqueConstraints = @UniqueConstraint(columnNames = {"profissional_id", "tipo"}))
public class RedeSocial extends AuditableEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "profissional_id", nullable = false) private Long profissionalId;
    @Column(nullable = false, length = 60) private String tipo;
    @Column(nullable = false, length = 2048) private String url;
    protected RedeSocial() {}
    public RedeSocial(Long profissionalId, String tipo, String url) { this.profissionalId = profissionalId; update(tipo, url); }
    public void update(String tipo, String url) { this.tipo = tipo.trim(); this.url = url.trim(); }
    public Long getId() { return id; }
    public Long getProfissionalId() { return profissionalId; }
    public String getTipo() { return tipo; }
    public String getUrl() { return url; }
}
