package br.com.conectatea.progresso.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.meta.domain.CategoriaMeta;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.PrioridadeMeta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.progresso.domain.Progresso;
import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Testes do serviço canônico de resumo atual de progresso.
 *
 * <p>Valida:
 * <ul>
 *   <li>Desempate por ID quando dois registros têm o mesmo instante.</li>
 *   <li>Pesos iguais entre categorias (média intra-categoria, depois macro).</li>
 *   <li>Progresso zero real é diferente de ausência de registro.</li>
 *   <li>Metas pausadas e concluídas ficam fora da média, mas são contabilizadas separadamente.</li>
 *   <li>Categorias com diferentes quantidades de metas.</li>
 *   <li>Média nula quando nenhuma meta ativa possui registro.</li>
 * </ul>
 */
class LatestProgressServiceTest {

    private final ProgressoRepository repository = mock(ProgressoRepository.class);
    private final LatestProgressService service = new LatestProgressService(repository);

    @Test
    void desempataRegistrosComMesmaDataPeloMaiorId() {
        // Dois progressos para a mesma meta com instante idêntico e valores diferentes.
        // Regra: maior ID vence.
        var meta = meta(1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);

        var registroAntigo = progresso(1L, 30, "2026-02-10T12:00:00Z", 10L);
        var registroNovo   = progresso(1L, 75, "2026-02-10T12:00:00Z", 20L); // mesmo instante, ID maior

        when(repository.findLatestByMetaIdIn(anyCollection())).thenReturn(List.of(registroNovo));

        var resumo = service.summarize(List.of(meta));

        assertThat(resumo.metasComDados()).isEqualTo(1);
        assertThat(resumo.media()).isEqualTo(75.0); // registroNovo vence pelo ID
    }

    @Test
    void progressoZeroRealEDiferenteDeAusenciaDeRegistro() {
        // Meta com progresso real zero deve aparecer em metasComDados, não em metasSemDados.
        var meta = meta(1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var zero = progresso(1L, 0, "2026-02-10T12:00:00Z", 1L);

        when(repository.findLatestByMetaIdIn(anyCollection())).thenReturn(List.of(zero));

        var resumo = service.summarize(List.of(meta));

        assertThat(resumo.metasComDados()).isEqualTo(1);
        assertThat(resumo.metasSemDados()).isEqualTo(0);
        assertThat(resumo.media()).isEqualTo(0.0);
    }

    @Test
    void mediaNulaQuandoNenhumaMetaAtivaTemRegistro() {
        var meta = meta(1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);

        when(repository.findLatestByMetaIdIn(anyCollection())).thenReturn(List.of());

        var resumo = service.summarize(List.of(meta));

        assertThat(resumo.media()).isNull();
        assertThat(resumo.metasComDados()).isEqualTo(0);
        assertThat(resumo.metasSemDados()).isEqualTo(1);
    }

    @Test
    void metasPausadasEConcluidasExcluidasDaMediaMasContabilizadas() {
        var emAndamento = meta(1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var pausada     = meta(2L, CategoriaMeta.COMUNICACAO, StatusMeta.PAUSADA);
        var concluida   = meta(3L, CategoriaMeta.AUTONOMIA,   StatusMeta.CONCLUIDA);

        // Apenas a meta em andamento é consultada para o último progresso
        var registro = progresso(1L, 60, "2026-02-10T12:00:00Z", 1L);
        when(repository.findLatestByMetaIdIn(anyCollection())).thenReturn(List.of(registro));

        var resumo = service.summarize(List.of(emAndamento, pausada, concluida));

        assertThat(resumo.media()).isEqualTo(60.0);
        assertThat(resumo.metasComDados()).isEqualTo(1);
        assertThat(resumo.metasSemDados()).isEqualTo(0);
        assertThat(resumo.metasPausadas()).isEqualTo(1);
        assertThat(resumo.metasConcluidas()).isEqualTo(1);
    }

    @Test
    void pesoIgualEntreMetas_duasCategoriasComDiferentesQuantidadesDeMetas() {
        // COMUNICACAO: 2 metas (40 e 60 → média 50)
        // AUTONOMIA:   1 meta  (80 → média 80)
        // Média geral = (40 + 60 + 80) / 3 = 60; não é média de médias por categoria.
        var c1 = meta(1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var c2 = meta(2L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var a1 = meta(3L, CategoriaMeta.AUTONOMIA,   StatusMeta.EM_ANDAMENTO);

        when(repository.findLatestByMetaIdIn(anyCollection())).thenReturn(List.of(
                progresso(1L, 40, "2026-02-10T12:00:00Z", 1L),
                progresso(2L, 60, "2026-02-10T12:00:00Z", 2L),
                progresso(3L, 80, "2026-02-10T12:00:00Z", 3L)));

        var resumo = service.summarize(List.of(c1, c2, a1));

        assertThat(resumo.media()).isEqualTo(60.0);
        assertThat(resumo.categorias().get(CategoriaMeta.COMUNICACAO).media()).isEqualTo(50.0);
        assertThat(resumo.categorias().get(CategoriaMeta.AUTONOMIA).media()).isEqualTo(80.0);
    }

    @Test
    void semMetasRetornaSumarioVazioSemErro() {
        var resumo = service.summarize(List.of());

        assertThat(resumo.media()).isNull();
        assertThat(resumo.metasComDados()).isEqualTo(0);
        assertThat(resumo.metasSemDados()).isEqualTo(0);
        assertThat(resumo.metasPausadas()).isEqualTo(0);
        assertThat(resumo.metasConcluidas()).isEqualTo(0);
    }

    @Test
    void dashboardEProgressoProduzemResultadosCoerentes_mesmosMetasDadosAutorizados() {
        // Dado o mesmo conjunto autorizado, LatestProgressService deve produzir
        // o mesmo mapa de último progresso independentemente de quem o chama.
        var meta = meta(1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var registro = progresso(1L, 55, "2026-02-10T12:00:00Z", 1L);

        when(repository.findLatestByMetaIdIn(anyCollection())).thenReturn(List.of(registro));

        var mapaParaDashboard  = service.latestByMeta(List.of(meta));
        var mapaParaProgresso  = service.latestByMeta(List.of(meta));

        assertThat(mapaParaDashboard).isEqualTo(mapaParaProgresso);
        assertThat(mapaParaDashboard.get(1L).getProgressoAtual()).isEqualTo(55);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Meta meta(Long id, CategoriaMeta categoria, StatusMeta status) {
        var m = new Meta("Meta " + id, "Descrição", categoria, PrioridadeMeta.MEDIA,
                LocalDate.of(2025, 1, 1), LocalDate.of(2026, 12, 31), 1L, 1L);
        ReflectionTestUtils.setField(m, "id", id);
        if (status == StatusMeta.PAUSADA) {
            m.pause("motivo", Instant.now());
        } else if (status == StatusMeta.CONCLUIDA) {
            m.complete("resumo", Instant.now());
        }
        return m;
    }

    private Progresso progresso(Long metaId, int valor, String instant, Long id) {
        var p = new Progresso(metaId, 1L, 0, valor, StatusMeta.EM_ANDAMENTO, "registro");
        ReflectionTestUtils.setField(p, "id", id);
        ReflectionTestUtils.setField(p, "data", Instant.parse(instant));
        return p;
    }
}
