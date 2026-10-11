package br.com.conectatea.progresso.infrastructure;

import br.com.conectatea.progresso.domain.Progresso;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProgressoRepository extends JpaRepository<Progresso, Long> {
    List<Progresso> findByMetaIdInOrderByDataAsc(Collection<Long> metaIds);
    List<Progresso> findByMetaIdInAndDataGreaterThanEqualAndDataLessThanOrderByDataDesc(
            Collection<Long> metaIds, Instant fromInclusive, Instant untilExclusive);

    /**
     * Retorna o último progresso de cada meta, com desempate determinístico por (data DESC, id DESC).
     * Quando dois registros têm o mesmo instante, o de maior ID prevalece.
     * Eficiente: usa DISTINCT ON / subquery sem carregar todo o histórico.
     */
    @Query(value = """
            SELECT DISTINCT ON (meta_id) *
            FROM progressos
            WHERE meta_id IN (:metaIds)
            ORDER BY meta_id, data DESC, id DESC
            """, nativeQuery = true)
    List<Progresso> findLatestByMetaIdIn(@Param("metaIds") Collection<Long> metaIds);
}
