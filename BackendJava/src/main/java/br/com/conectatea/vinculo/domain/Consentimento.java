package br.com.conectatea.vinculo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "consentimentos")
public class Consentimento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "responsavel_id")
    private Long responsavelId;
    @Column(name = "crianca_id")
    private Long criancaId;
    @Column(name = "profissional_id")
    private Long profissionalId;
    private boolean aceito;
    @Column(name = "termo_versao")
    private String termoVersao;
    private String finalidade;
    @Column(name = "tipo_aceite", nullable = false, length = 40)
    private String tipoAceite = "RESPONSAVEL_COMPARTILHAMENTO";
    @Column(name = "data_aceite")
    private Instant dataAceite;
    @Column(name = "data_revogacao")
    private Instant dataRevogacao;
    private String ip;
    @Column(name = "user_agent")
    private String userAgent;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    protected Consentimento() {
    }

    public Consentimento(
            Long guardianId,
            Long childId,
            Long professionalId,
            String ip,
            String userAgent,
            String termVersion,
            String purpose) {
        responsavelId = guardianId;
        criancaId = childId;
        profissionalId = professionalId;
        aceito = true;
        termoVersao = termVersion;
        finalidade = purpose;
        dataAceite = Instant.now();
        this.ip = ip;
        this.userAgent = userAgent;
    }
}
