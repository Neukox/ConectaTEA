package br.com.conectatea.profissional.infrastructure;
import br.com.conectatea.profissional.domain.Profissional;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface ProfissionalRepository extends JpaRepository<Profissional,Long>{
 Optional<Profissional> findByUsuarioId(Long usuarioId);
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select p from Profissional p where p.usuarioId = :usuarioId")
 Optional<Profissional> findByUsuarioIdForUpdate(@Param("usuarioId") Long usuarioId);
}

