package br.com.conectatea.emailverification.infrastructure;

import br.com.conectatea.emailverification.domain.EmailVerificationToken;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from EmailVerificationToken t join fetch t.usuario where t.tokenHash=:hash")
    Optional<EmailVerificationToken> findByHashForUpdate(@Param("hash") String hash);

    Optional<EmailVerificationToken> findFirstByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update EmailVerificationToken t set t.invalidadoEm=:now where t.usuario.id=:userId and t.consumidoEm is null and t.invalidadoEm is null and t.expiraEm>:now")
    int invalidateActiveByUser(@Param("userId") Long userId, @Param("now") Instant now);
}
