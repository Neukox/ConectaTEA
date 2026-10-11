package br.com.conectatea.vinculo.infrastructure;

import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
import java.util.List;
import java.util.Optional;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface VinculoProfissionalRepository extends JpaRepository<VinculoProfissionalCrianca, Long> {
    boolean existsByProfissionalIdAndCriancaIdAndStatus(Long profissionalId, Long criancaId, StatusVinculo status);
    List<VinculoProfissionalCrianca> findAllByCriancaIdAndStatus(Long criancaId, StatusVinculo status);
    Optional<VinculoProfissionalCrianca> findByProfissionalIdAndCriancaIdAndStatus(
            Long profissionalId, Long criancaId, StatusVinculo status);
    Optional<VinculoProfissionalCrianca> findByProfissionalIdAndCriancaId(Long profissionalId, Long criancaId);
    List<VinculoProfissionalCrianca> findAllByProfissionalIdAndStatus(
            Long profissionalId, StatusVinculo status);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from VinculoProfissionalCrianca v where v.id=:id and v.criancaId=:childId and v.status=:status")
    Optional<VinculoProfissionalCrianca> findByIdAndChildForUpdate(
            @Param("id") Long id, @Param("childId") Long childId, @Param("status") StatusVinculo status);

    @Query("select distinct v.criancaId from VinculoProfissionalCrianca v where v.profissionalId=:id and v.status=:status")
    List<Long> findCriancaIdsByProfissionalIdAndStatus(@Param("id") Long id, @Param("status") StatusVinculo status);

    @Query("select count(distinct v.profissionalId) from VinculoProfissionalCrianca v where v.criancaId in :childIds and v.status=:status")
    long countDistinctProfissionaisByCriancaIdInAndStatus(@Param("childIds") List<Long> childIds, @Param("status") StatusVinculo status);
    @Query("select count(distinct v.profissionalId) from VinculoProfissionalCrianca v where v.criancaId in :childIds and v.status=:status and v.dataVinculo>=:inicio and v.dataVinculo<:fim")
    long countDistinctProfissionaisVinculadosNoPeriodo(@Param("childIds") List<Long> childIds,@Param("status") StatusVinculo status,@Param("inicio") Instant inicio,@Param("fim") Instant fim);
}
