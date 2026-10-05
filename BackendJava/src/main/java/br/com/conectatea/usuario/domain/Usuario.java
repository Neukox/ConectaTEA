package br.com.conectatea.usuario.domain;

import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.*;

@Entity @Table(name="usuarios")
public class Usuario extends AuditableEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=150) private String nome;
    @Column(nullable=false,length=255) private String email;
    @Column(name="password_hash",nullable=false,length=100) private String passwordHash;
    @Column(length=20) private String telefone;
    @Column(length=255) private String endereco;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TipoUsuario tipo;
    @Column(nullable=false) private boolean ativo=true;
    protected Usuario() {}
    public Usuario(String nome,String email,String passwordHash,String telefone,String endereco,TipoUsuario tipo){this.nome=nome;this.email=email.trim().toLowerCase();this.passwordHash=passwordHash;this.telefone=telefone;this.endereco=endereco;this.tipo=tipo;}
    public Long getId(){return id;} public String getNome(){return nome;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public String getTelefone(){return telefone;} public String getEndereco(){return endereco;} public TipoUsuario getTipo(){return tipo;} public boolean isAtivo(){return ativo;}
    public void atualizar(String nome,String telefone,String endereco){this.nome=nome;this.telefone=telefone;this.endereco=endereco;}
    public void atualizarSenha(String passwordHash){this.passwordHash=passwordHash;}
    public void desativar(){ativo=false;}
}

