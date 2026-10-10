package br.com.conectatea.meta.domain;

import br.com.conectatea.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import br.com.conectatea.shared.domain.BusinessRuleException;

@Entity
@Table(name = "metas")
public class Meta extends AuditableEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String titulo;
    @Column(columnDefinition = "text") private String descricao;
    @Enumerated(EnumType.STRING) private CategoriaMeta categoria;
    @Enumerated(EnumType.STRING) private PrioridadeMeta prioridade;
    @Enumerated(EnumType.STRING) private StatusMeta status;
    private int progresso;
    @Column(name = "data_inicio") private LocalDate dataInicio;
    @Column(name = "data_fim") private LocalDate dataFim;
    @Column(name = "crianca_id") private Long criancaId;
    @Column(name = "profissional_id") private Long profissionalId;
    @Column(name = "pausada_em") private Instant pausadaEm;
    @Column(name = "motivo_pausa") private String motivoPausa;
    @Version private long version;

    protected Meta() {}

    public Meta(String titulo, String descricao, CategoriaMeta categoria, PrioridadeMeta prioridade,
                LocalDate inicio, LocalDate fim, Long criancaId, Long profissionalId) {
        this.titulo = titulo; this.descricao = descricao; this.categoria = categoria;
        this.prioridade = prioridade; this.dataInicio = inicio; this.dataFim = fim;
        this.criancaId = criancaId; this.profissionalId = profissionalId;
        this.status = StatusMeta.EM_ANDAMENTO;
    }

    public Long getId(){return id;} public String getTitulo(){return titulo;}
    public String getDescricao(){return descricao;} public CategoriaMeta getCategoria(){return categoria;}
    public PrioridadeMeta getPrioridade(){return prioridade;} public StatusMeta getStatus(){return status;}
    public int getProgresso(){return progresso;} public LocalDate getDataInicio(){return dataInicio;}
    public LocalDate getDataFim(){return dataFim;} public Long getCriancaId(){return criancaId;}
    public Long getProfissionalId(){return profissionalId;} public Instant getPausadaEm(){return pausadaEm;}
    public String getMotivoPausa(){return motivoPausa;}

    public void update(String titulo, String descricao, CategoriaMeta categoria,
                       PrioridadeMeta prioridade, LocalDate inicio, LocalDate fim) {
        this.titulo=titulo; this.descricao=descricao; this.categoria=categoria;
        this.prioridade=prioridade; this.dataInicio=inicio; this.dataFim=fim;
    }

    public void progress(int value) {
        if (status == StatusMeta.PAUSADA) throw new BusinessRuleException("META_PAUSED", "Meta pausada não aceita progresso");
        if (status == StatusMeta.CONCLUIDA) throw new BusinessRuleException("META_COMPLETED", "Meta concluída não aceita progresso");
        progresso = value;
    }

    public void pause(String reason, Instant at) {
        if (status != StatusMeta.EM_ANDAMENTO) throw new BusinessRuleException("META_CANNOT_PAUSE", "Somente meta em andamento pode ser pausada");
        status = StatusMeta.PAUSADA; motivoPausa = reason; pausadaEm = at;
    }

    public void resume(LocalDate deadline) {
        if (status != StatusMeta.PAUSADA) throw new BusinessRuleException("META_CANNOT_RESUME", "Somente meta pausada pode ser retomada");
        dataFim = deadline; status = StatusMeta.EM_ANDAMENTO; motivoPausa = null; pausadaEm = null;
    }
}
