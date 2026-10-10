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
import java.time.Instant;

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
    @Column(nullable=false,length=100) private String titulo;
    @Column(columnDefinition="text") private String temas;
    @Column(name="sessao_id") private Long sessaoId;
    @Column(name="compartilhada_em") private Instant compartilhadaEm;
    @Column(name="snapshot_crianca_id",nullable=false) private Long snapshotCriancaId;
    @Column(name="snapshot_crianca_nome",length=200) private String snapshotCriancaNome;
    @Column(name="snapshot_capturado_em",nullable=false) private Instant snapshotCapturadoEm;
    @Column(name="snapshot_origem",nullable=false,length=24) private String snapshotOrigem;

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
        capturarSnapshot(crianca);
        this.titulo="Anotação"; atualizar(conteudo, visibilidade);
    }

    public Anotacao(Crianca crianca,Profissional autor,String titulo,String conteudo,String temas,Long sessaoId){this.crianca=crianca;this.autor=autor;capturarSnapshot(crianca);this.titulo=titulo.trim();this.conteudo=conteudo.trim();this.temas=temas;this.sessaoId=sessaoId;this.visibilidade=VisibilidadeAnotacao.PRIVADA;}

    private void capturarSnapshot(Crianca crianca){snapshotCriancaId=crianca.getId();snapshotCriancaNome=crianca.getNome();snapshotCapturadoEm=Instant.now();snapshotOrigem="CRIACAO";}

    public void atualizar(String conteudo, VisibilidadeAnotacao visibilidade) {
        if(this.visibilidade==VisibilidadeAnotacao.COMPARTILHADA&&visibilidade==VisibilidadeAnotacao.PRIVADA)throw new br.com.conectatea.shared.domain.BusinessRuleException("SHARED_NOTE_IMMUTABLE_VISIBILITY","Anotação compartilhada não volta a privada");
        this.conteudo = conteudo.trim();
        this.visibilidade = visibilidade;
        if(visibilidade==VisibilidadeAnotacao.COMPARTILHADA&&compartilhadaEm==null)compartilhadaEm=Instant.now();
    }
    public void corrigir(String titulo,String conteudo,String temas){this.titulo=titulo.trim();this.conteudo=conteudo.trim();this.temas=temas;}

    public Long getId() { return id; }
    public Crianca getCrianca() { return crianca; }
    public Profissional getAutor() { return autor; }
    public String getConteudo() { return conteudo; }
    public VisibilidadeAnotacao getVisibilidade() { return visibilidade; }
    public String getTitulo(){return titulo;} public String getTemas(){return temas;} public Long getSessaoId(){return sessaoId;} public Instant getCompartilhadaEm(){return compartilhadaEm;}
    public Long getSnapshotCriancaId(){return snapshotCriancaId;} public String getSnapshotCriancaNome(){return snapshotCriancaNome;} public Instant getSnapshotCapturadoEm(){return snapshotCapturadoEm;} public String getSnapshotOrigem(){return snapshotOrigem;}
}
