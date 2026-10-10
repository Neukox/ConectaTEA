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
 @Query("select (count(c)>0) from ConviteCirculo c where c.criancaId=:childId and c.destinatarioUsuarioId=:recipient and c.papel=:role and c.status='PENDENTE_ACEITE' and c.expiraEm>:now")
 boolean existsPendingUsable(@Param("childId") Long childId,@Param("recipient") Long recipient,@Param("role") br.com.conectatea.vinculo.domain.PapelCirculo role,@Param("now") java.time.Instant now);
}
