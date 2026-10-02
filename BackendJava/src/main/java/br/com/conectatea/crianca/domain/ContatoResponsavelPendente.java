package br.com.conectatea.crianca.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "contatos_responsaveis_pendentes")
public class ContatoResponsavelPendente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "crianca_id", nullable = false)
    private Long criancaId;

    private String nome;
    private String email;
    private String telefone;
    private String parentesco;

    protected ContatoResponsavelPendente() {
    }

    public ContatoResponsavelPendente(
            Long criancaId,
            String nome,
            String email,
            String telefone,
            String parentesco) {
        this.criancaId = criancaId;
        this.nome = nome;
        this.email = email == null ? null : email.trim().toLowerCase();
        this.telefone = telefone;
        this.parentesco = parentesco;
    }
}
