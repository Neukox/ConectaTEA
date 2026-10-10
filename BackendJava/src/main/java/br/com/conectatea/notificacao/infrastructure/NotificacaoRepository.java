package br.com.conectatea.notificacao.infrastructure;

import br.com.conectatea.notificacao.domain.Notificacao;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findAllByDestinatarioUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
    List<Notificacao> findAllByDestinatarioUsuarioIdAndOcultadaSinoFalseOrderByCreatedAtDesc(Long usuarioId);

    long countByDestinatarioUsuarioIdAndLidaFalse(Long usuarioId);

    Optional<Notificacao> findByIdAndDestinatarioUsuarioId(Long id, Long usuarioId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Notificacao n
               set n.lida = true, n.lidaEm = :lidaEm
             where n.destinatarioUsuarioId = :usuarioId and n.lida = false
            """)
    int marcarTodasComoLidas(@Param("usuarioId") Long usuarioId, @Param("lidaEm") Instant lidaEm);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Notificacao n set n.ocultadaSino = true where n.destinatarioUsuarioId = :usuarioId and n.ocultadaSino = false")
    int limparSino(@Param("usuarioId") Long usuarioId);
}
