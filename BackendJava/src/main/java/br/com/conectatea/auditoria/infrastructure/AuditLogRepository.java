package br.com.conectatea.auditoria.infrastructure;
import br.com.conectatea.auditoria.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditLogRepository extends JpaRepository<AuditLog,Long>{}
