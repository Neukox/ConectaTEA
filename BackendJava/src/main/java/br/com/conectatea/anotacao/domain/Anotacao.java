package br.com.conectatea.anotacao.domain;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "anotacoes")
public class Anotacao extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "crianca_id", nullable = false)
    private Crianca crianca;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_profissional_id", nullable = false)
    private Profissional autor;

    @Column(nullable = false, length = 3000)
    private String conteudo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VisibilidadeAnotacao visibilidade;

    protected Anotacao() {
    }

    public Anotacao(
            Crianca crianca,
            Profissional autor,
            String conteudo,
            VisibilidadeAnotacao visibilidade) {
        this.crianca = crianca;
        this.autor = autor;
        atualizar(conteudo, visibilidade);
    }

    public void atualizar(String conteudo, VisibilidadeAnotacao visibilidade) {
        this.conteudo = conteudo.trim();
        this.visibilidade = visibilidade;
    }

    public Long getId() { return id; }
    public Crianca getCrianca() { return crianca; }
    public Profissional getAutor() { return autor; }
    public String getConteudo() { return conteudo; }
    public VisibilidadeAnotacao getVisibilidade() { return visibilidade; }
}
