package br.com.conectatea.passwordreset.infrastructure;

import br.com.conectatea.passwordreset.domain.PasswordResetToken;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    long countByUsuarioId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from PasswordResetToken t join fetch t.usuario where t.tokenHash=:hash")
    Optional<PasswordResetToken> findByHashForUpdate(@Param("hash") String hash);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update PasswordResetToken t set t.invalidatedAt=:now where t.usuario.id=:userId and t.usedAt is null and t.invalidatedAt is null and t.expiresAt>:now")
    int invalidateActiveByUser(@Param("userId") Long userId, @Param("now") Instant now);
}
