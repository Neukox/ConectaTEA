package br.com.conectatea.vinculo.infrastructure;

import br.com.conectatea.vinculo.domain.SolicitacaoTokenVinculo;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface SolicitacaoTokenVinculoRepository extends JpaRepository<SolicitacaoTokenVinculo,Long> {
    List<SolicitacaoTokenVinculo> findAllByCriancaIdAndStatusOrderById(Long childId, String status);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from SolicitacaoTokenVinculo s where s.id=:id")
    Optional<SolicitacaoTokenVinculo> findByIdForUpdate(@Param("id") Long id);
}
