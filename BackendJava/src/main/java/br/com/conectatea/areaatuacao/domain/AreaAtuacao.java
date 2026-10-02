package br.com.conectatea.areaatuacao.domain;

import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "areas_atuacao")
public class AreaAtuacao extends AuditableEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 150) private String nome;
    protected AreaAtuacao() {}
    public Long getId() { return id; }
    public String getNome() { return nome; }
}
