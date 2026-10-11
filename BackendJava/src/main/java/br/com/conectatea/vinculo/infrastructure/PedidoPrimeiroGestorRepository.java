package br.com.conectatea.vinculo.infrastructure;
import br.com.conectatea.vinculo.domain.PedidoPrimeiroGestor; import jakarta.persistence.LockModeType; import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface PedidoPrimeiroGestorRepository extends JpaRepository<PedidoPrimeiroGestor,Long>{
 List<PedidoPrimeiroGestor> findAllByStatusOrderByCriadoEmAscIdAsc(String status);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select p from PedidoPrimeiroGestor p where p.id=:id") Optional<PedidoPrimeiroGestor> findByIdForUpdate(@Param("id") Long id);
}
