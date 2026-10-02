package br.com.conectatea.localatendimento.domain;

import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "locais_atendimento", uniqueConstraints = @UniqueConstraint(columnNames = {"profissional_id", "nome", "cidade"}))
public class LocalAtendimento extends AuditableEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "profissional_id", nullable = false) private Long profissionalId;
    @Column(nullable = false, length = 150) private String nome;
    @Column(nullable = false, length = 120) private String cidade;
    protected LocalAtendimento() {}
    public LocalAtendimento(Long profissionalId, String nome, String cidade) { this.profissionalId = profissionalId; update(nome, cidade); }
    public void update(String nome, String cidade) { this.nome = nome.trim(); this.cidade = cidade.trim(); }
    public Long getId() { return id; }
    public Long getProfissionalId() { return profissionalId; }
    public String getNome() { return nome; }
    public String getCidade() { return cidade; }
}
