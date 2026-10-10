package br.com.conectatea.vinculo.infrastructure;
import br.com.conectatea.vinculo.domain.ConviteCirculo;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface ConviteCirculoRepository extends JpaRepository<ConviteCirculo,Long>{
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select c from ConviteCirculo c where c.codigoHash=:hash") Optional<ConviteCirculo> findByHashForUpdate(@Param("hash") String hash);
 List<ConviteCirculo> findAllByCriancaIdOrderByCreatedAtDesc(Long childId);
 List<ConviteCirculo> findAllByDestinatarioUsuarioIdOrderByCreatedAtDesc(Long userId);
 boolean existsByCriancaIdAndDestinatarioUsuarioIdAndPapelAndStatus(Long childId,Long recipient,br.com.conectatea.vinculo.domain.PapelCirculo role,String status);
}
