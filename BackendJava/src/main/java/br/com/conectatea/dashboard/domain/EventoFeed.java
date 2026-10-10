package br.com.conectatea.dashboard.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "eventos_feed")
public class EventoFeed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "crianca_id")
    private Long criancaId;

    @Column(name = "ator_usuario_id")
    private Long atorUsuarioId;

    private String tipo;
    
    @Column(name = "recurso_tipo")
    private String recursoTipo;

    @Column(name = "recurso_id")
    private Long recursoId;

    private String titulo;
    private String resumo;
    
    private boolean compartilhado;

    @Column(name = "criado_em")
    private Instant criadoEm;

    protected EventoFeed() {
    }

    public EventoFeed(Long criancaId, Long atorUsuarioId, String tipo, String recursoTipo, Long recursoId, String titulo, String resumo, boolean compartilhado) {
        this.criancaId = criancaId;
        this.atorUsuarioId = atorUsuarioId;
        this.tipo = tipo;
        this.recursoTipo = recursoTipo;
        this.recursoId = recursoId;
        this.titulo = titulo;
        this.resumo = resumo;
        this.compartilhado = compartilhado;
        this.criadoEm = Instant.now();
    }

    public Long getId() { return id; }
    public Long getCriancaId() { return criancaId; }
    public Long getAtorUsuarioId() { return atorUsuarioId; }
    public String getTipo() { return tipo; }
    public String getRecursoTipo() { return recursoTipo; }
    public Long getRecursoId() { return recursoId; }
    public String getTitulo() { return titulo; }
    public String getResumo() { return resumo; }
    public boolean isCompartilhado() { return compartilhado; }
    public Instant getCriadoEm() { return criadoEm; }
}
