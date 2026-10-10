package br.com.conectatea.anotacao.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="versoes_anotacao")
public class VersaoAnotacao {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="anotacao_id") private Long anotacaoId;
    private int numero;
    private String titulo;
    @Column(columnDefinition="text") private String conteudo;
    @Column(columnDefinition="text") private String temas;
    @Column(name="motivo_correcao") private String motivo;
    @Column(name="autor_usuario_id") private Long autor;
    @Column(name="criado_em") private Instant criadoEm=Instant.now();
    protected VersaoAnotacao(){}
    public VersaoAnotacao(Long n,int v,String t,String c,String tags,String m,Long a){anotacaoId=n;numero=v;titulo=t;conteudo=c;temas=tags;motivo=m;autor=a;}
    public Long getId(){return id;} public Long getAnotacaoId(){return anotacaoId;} public int getNumero(){return numero;} public String getTitulo(){return titulo;} public String getConteudo(){return conteudo;} public String getTemas(){return temas;} public String getMotivo(){return motivo;} public Long getAutor(){return autor;} public Instant getCriadoEm(){return criadoEm;}
}
