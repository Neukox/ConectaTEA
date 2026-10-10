package br.com.conectatea.crianca.domain;
import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="criancas")
public class Crianca extends AuditableEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String nome;
 @Column(name="data_nascimento",nullable=false) private LocalDate dataNascimento; private String genero; @Column(columnDefinition="text") private String diagnostico;
 @Column(name="diagnostico_detalhes",columnDefinition="text") private String diagnosticoDetalhes; @Column(columnDefinition="text") private String observacoes; @Column(nullable=false) private boolean arquivada;
 private String escola; private String escolaridade; private String cidade; private String uf;
 @Column(columnDefinition="text") private String interesses; @Column(name="nivel_suporte") private Short nivelSuporte;
 protected Crianca(){} public Crianca(String n,LocalDate d,String g,String diag,String detalhes,String obs){nome=n;dataNascimento=d;genero=g;diagnostico=diag;diagnosticoDetalhes=detalhes;observacoes=obs;}
 public Long getId(){return id;} public String getNome(){return nome;} public LocalDate getDataNascimento(){return dataNascimento;} public String getGenero(){return genero;} public String getDiagnostico(){return diagnostico;} public String getDiagnosticoDetalhes(){return diagnosticoDetalhes;} public String getObservacoes(){return observacoes;} public boolean isArquivada(){return arquivada;}
 public String getEscola(){return escola;} public String getEscolaridade(){return escolaridade;} public String getCidade(){return cidade;} public String getUf(){return uf;} public String getInteresses(){return interesses;} public Integer getNivelSuporte(){return nivelSuporte == null ? null : nivelSuporte.intValue();}
 public void update(String n,LocalDate d,String g,String diag,String det,String obs){nome=n;dataNascimento=d;genero=g;diagnostico=diag;diagnosticoDetalhes=det;observacoes=obs;} public void arquivar(){arquivada=true;}
 public void updateStructured(String escola,String escolaridade,String cidade,String uf,String interesses,Integer nivelSuporte){this.escola=escola;this.escolaridade=escolaridade;this.cidade=cidade;this.uf=uf;this.interesses=interesses;this.nivelSuporte=nivelSuporte == null ? null : nivelSuporte.shortValue();}
}

