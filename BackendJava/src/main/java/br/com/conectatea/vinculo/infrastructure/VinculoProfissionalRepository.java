package br.com.conectatea.vinculo.infrastructure;

import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
import java.util.List;
import java.util.Optional;
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
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from VinculoProfissionalCrianca v where v.id=:id and v.criancaId=:childId and v.status=:status")
    Optional<VinculoProfissionalCrianca> findByIdAndChildForUpdate(
            @Param("id") Long id, @Param("childId") Long childId, @Param("status") StatusVinculo status);
}
