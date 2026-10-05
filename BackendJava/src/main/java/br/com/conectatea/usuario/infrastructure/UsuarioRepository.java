package br.com.conectatea.usuario.infrastructure;
import br.com.conectatea.usuario.domain.Usuario;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface UsuarioRepository extends JpaRepository<Usuario,Long>{ Optional<Usuario> findByEmailIgnoreCase(String email); boolean existsByEmailIgnoreCase(String email);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from Usuario u where lower(u.email)=lower(:email)") Optional<Usuario> findByEmailForUpdate(@Param("email") String email);
}

