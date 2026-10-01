package br.com.conectatea.vinculo.infrastructure;

import br.com.conectatea.vinculo.domain.TokenVinculo;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TokenVinculoRepository extends JpaRepository<TokenVinculo, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from TokenVinculo t where t.codigoHash=:hash")
    Optional<TokenVinculo> findByHashForUpdate(@Param("hash") String hash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from TokenVinculo t where t.id=:id")
    Optional<TokenVinculo> findByIdForUpdate(@Param("id") Long id);

    Optional<TokenVinculo> findByCodigoHash(String hash);
}
