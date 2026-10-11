package br.com.conectatea.profissional.domain;
import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.*;
@Entity @Table(name="profissionais")
public class Profissional extends AuditableEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="usuario_id",nullable=false,unique=true) private Long usuarioId;
 private String especialidade; @Column(name="registro_profissional") private String registroProfissional; private String titulo;
 @Column(name="formacao_academica") private String formacaoAcademica; @Column(columnDefinition="text") private String sobre;
 @Column(name="foto_perfil_url") private String fotoPerfilUrl; @Column(name="codigo_identificacao",unique=true) private String codigoIdentificacao;
 protected Profissional(){} public Profissional(Long usuarioId,String codigo){this.usuarioId=usuarioId;this.codigoIdentificacao=codigo;}
 public Long getId(){return id;} public Long getUsuarioId(){return usuarioId;} public String getEspecialidade(){return especialidade;} public String getRegistroProfissional(){return registroProfissional;} public String getTitulo(){return titulo;} public String getFormacaoAcademica(){return formacaoAcademica;} public String getSobre(){return sobre;} public String getFotoPerfilUrl(){return fotoPerfilUrl;} public String getCodigoIdentificacao(){return codigoIdentificacao;}
 public void setFotoPerfilUrl(String fotoPerfilUrl){this.fotoPerfilUrl=fotoPerfilUrl;}
 public void update(String e,String r,String t,String f,String s,String foto){especialidade=e;registroProfissional=r;titulo=t;formacaoAcademica=f;sobre=s;fotoPerfilUrl=foto;}
}

