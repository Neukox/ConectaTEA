package br.com.conectatea.progresso.application;

import br.com.conectatea.meta.domain.CategoriaMeta;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.progresso.domain.Progresso;
import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.EnumMap;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Regra canônica de resumo atual de progresso.
 *
 * <p>Desempate: quando dois registros têm o mesmo instante, o de maior ID prevalece.
 * A query nativa {@code DISTINCT ON (meta_id) … ORDER BY meta_id, data DESC, id DESC}
 * garante essa semântica no banco, sem depender da ordem incidental retornada pelo JPA.
 *
 * <p>Regras preservadas:
 * <ul>
 *   <li>Média calculada apenas sobre metas {@code EM_ANDAMENTO}.</li>
 *   <li>Pesos iguais entre metas; resumos por categoria preservam a mesma regra.</li>
 *   <li>Ausência de registro não equivale a zero: metas sem dados ficam explícitas no contador.</li>
 *   <li>Média indisponível retornada como {@code null}, não como zero.</li>
 *   <li>Pausadas e concluídas contabilizadas separadamente.</li>
 * </ul>
 */
@Service
public class LatestProgressService {

    private final ProgressoRepository progressoRepository;

    public LatestProgressService(ProgressoRepository progressoRepository) {
        this.progressoRepository = progressoRepository;
    }

    /**
     * Calcula o resumo atual de progresso para o conjunto de metas autorizado.
     *
     * @param authorizedGoals metas às quais o usuário tem acesso (já filtradas por vínculo ativo)
     * @return resumo com média, contagens e separação por status
     */
    public ProgressSummary summarize(List<Meta> authorizedGoals) {
        var activeGoals = authorizedGoals.stream()
                .filter(g -> g.getStatus() == StatusMeta.EM_ANDAMENTO)
                .toList();

        var latestByMeta = loadLatest(activeGoals);

        var goalsWithData = activeGoals.stream()
                .filter(g -> latestByMeta.containsKey(g.getId()))
                .toList();

        Double average = goalsWithData.isEmpty() ? null : goalsWithData.stream()
                .mapToInt(goal -> latestByMeta.get(goal.getId()).getProgressoAtual())
                .average()
                .orElseThrow();

        var categories = new EnumMap<CategoriaMeta, CategorySummary>(CategoriaMeta.class);
        activeGoals.stream().collect(Collectors.groupingBy(Meta::getCategoria)).forEach((category, goals) -> {
            var known = goals.stream().filter(goal -> latestByMeta.containsKey(goal.getId())).toList();
            categories.put(category, new CategorySummary(
                    known.isEmpty() ? null : known.stream()
                            .mapToInt(goal -> latestByMeta.get(goal.getId()).getProgressoAtual())
                            .average().orElseThrow(),
                    known.size(), goals.size() - known.size()));
        });

        long paused = authorizedGoals.stream()
                .filter(g -> g.getStatus() == StatusMeta.PAUSADA)
                .count();
        long completed = authorizedGoals.stream()
                .filter(g -> g.getStatus() == StatusMeta.CONCLUIDA)
                .count();

        return new ProgressSummary(
                average,
                goalsWithData.size(),
                activeGoals.size() - goalsWithData.size(),
                paused,
                completed,
                categories);
    }

    /**
     * Carrega o último progresso de cada meta ativa com desempate determinístico.
     * A query usa {@code DISTINCT ON} do PostgreSQL, ordenando por {@code (data DESC, id DESC)}.
     */
    private Map<Long, Progresso> loadLatest(List<Meta> activeGoals) {
        if (activeGoals.isEmpty()) {
            return Map.of();
        }
        var ids = activeGoals.stream().map(Meta::getId).toList();
        return progressoRepository.findLatestByMetaIdIn(ids)
                .stream()
                .collect(Collectors.toMap(Progresso::getMetaId, p -> p, (a, b) -> b, LinkedHashMap::new));
    }

    /**
     * Retorna o mapa de último progresso por meta (para uso em indicadores por categoria).
     */
    public Map<Long, Progresso> latestByMeta(List<Meta> activeGoals) {
        return loadLatest(activeGoals);
    }

    /**
     * Resumo de progresso atual.
     *
     * @param media              média com peso igual por meta com dados (null sem dados)
     * @param metasComDados      metas EM_ANDAMENTO com pelo menos um registro de progresso
     * @param metasSemDados      metas EM_ANDAMENTO sem nenhum registro
     * @param metasPausadas      metas com status PAUSADA
     * @param metasConcluidas    metas com status CONCLUIDA
     */
    public record ProgressSummary(
            Double media,
            int metasComDados,
            int metasSemDados,
            long metasPausadas,
            long metasConcluidas,
            Map<CategoriaMeta, CategorySummary> categorias) {
    }

    public record CategorySummary(Double media, int metasComDados, int metasSemDados) {
    }
}
