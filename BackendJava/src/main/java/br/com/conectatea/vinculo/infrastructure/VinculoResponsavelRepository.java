package br.com.conectatea.vinculo.infrastructure;

import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VinculoResponsavelRepository extends JpaRepository<VinculoResponsavelCrianca, Long> {
    boolean existsByResponsavelIdAndCriancaIdAndStatus(Long responsavelId, Long criancaId, StatusVinculo status);
    boolean existsByResponsavelIdAndCriancaIdAndStatusAndPapel(
            Long responsavelId, Long criancaId, StatusVinculo status,
            br.com.conectatea.vinculo.domain.PapelCirculo papel);
    Optional<VinculoResponsavelCrianca> findByResponsavelIdAndCriancaId(Long responsavelId, Long criancaId);
    List<VinculoResponsavelCrianca> findAllByCriancaIdAndStatus(Long criancaId, StatusVinculo status);
    List<VinculoResponsavelCrianca> findAllByResponsavelIdAndStatus(Long responsavelId, StatusVinculo status);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from VinculoResponsavelCrianca v where v.criancaId=:criancaId and v.status=:status order by v.id")
    List<VinculoResponsavelCrianca> lockActiveByChild(@Param("criancaId") Long criancaId,
                                                       @Param("status") StatusVinculo status);
}
