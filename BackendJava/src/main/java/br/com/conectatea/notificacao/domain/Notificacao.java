package br.com.conectatea.notificacao.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Clock;
import java.time.Instant;

@Entity
@Table(name = "notificacoes")
public class Notificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "destinatario_usuario_id", nullable = false)
    private Long destinatarioUsuarioId;

    @Column(name = "ator_usuario_id")
    private Long atorUsuarioId;

    @Column(name = "crianca_id", nullable = false)
    private Long criancaId;

    @Column(name = "anotacao_id")
    private Long anotacaoId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TipoNotificacao tipo;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensagem;

    @Column(nullable = false)
    private boolean lida;

    @Column(name = "ocultada_sino", nullable = false)
    private boolean ocultadaSino;

    @Column(name = "lida_em")
    private Instant lidaEm;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Notificacao() {
    }

    public Notificacao(Long destinatarioUsuarioId, Long atorUsuarioId, Long criancaId,
            Long anotacaoId, TipoNotificacao tipo, String titulo, String mensagem, Instant createdAt) {
        this.destinatarioUsuarioId = destinatarioUsuarioId;
        this.atorUsuarioId = atorUsuarioId;
        this.criancaId = criancaId;
        this.anotacaoId = anotacaoId;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.createdAt = createdAt;
    }

    public void marcarComoLida(Clock clock) {
        if (!lida) {
            lida = true;
            lidaEm = Instant.now(clock);
        }
    }

    public Long getId() { return id; }
    public Long getDestinatarioUsuarioId() { return destinatarioUsuarioId; }
    public Long getAtorUsuarioId() { return atorUsuarioId; }
    public Long getCriancaId() { return criancaId; }
    public Long getAnotacaoId() { return anotacaoId; }
    public TipoNotificacao getTipo() { return tipo; }
    public String getTitulo() { return titulo; }
    public String getMensagem() { return mensagem; }
    public boolean isLida() { return lida; }
    public boolean isOcultadaSino() { return ocultadaSino; }
    public Instant getLidaEm() { return lidaEm; }
    public Instant getCreatedAt() { return createdAt; }
}
