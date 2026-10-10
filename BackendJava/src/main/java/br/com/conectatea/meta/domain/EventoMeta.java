package br.com.conectatea.meta.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "eventos_metas")
public class EventoMeta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "meta_id", nullable = false) private Long metaId;
    @Column(name = "autor_profissional_id", nullable = false) private Long autorProfissionalId;
    @Column(nullable = false) private String tipo;
    private String motivo;
    @Column(name = "prazo_anterior") private LocalDate prazoAnterior;
    @Column(name = "prazo_novo") private LocalDate prazoNovo;
    @Column(nullable = false) private Instant data;
    protected EventoMeta() {}
    public EventoMeta(Long metaId, Long autor, String tipo, String motivo, LocalDate anterior, LocalDate novo) {
        this.metaId=metaId; this.autorProfissionalId=autor; this.tipo=tipo; this.motivo=motivo;
        this.prazoAnterior=anterior; this.prazoNovo=novo; this.data=Instant.now();
    }
}
