package br.com.conectatea.auditoria.application;

import br.com.conectatea.auditoria.domain.AuditLog;
import br.com.conectatea.auditoria.infrastructure.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** Auditoria transacional obrigatória para eventos de sucesso. */
@Service
public class AuditLogService {
    private static final Set<String> ATTEMPT_RESULTS = Set.of("TENTATIVA", "FALHA");
    private final AuditLogRepository repository;
    public AuditLogService(AuditLogRepository repository) { this.repository = repository; }

    @Transactional(propagation = Propagation.REQUIRED)
    public void record(Long actor, String event, String resource, Long resourceId, Long childId,
                       Long professionalId, String result, String metadata) {
        if (!"SUCESSO".equals(result)) throw new IllegalArgumentException("record é exclusivo para eventos de sucesso");
        save(actor, event, resource, resourceId, childId, professionalId, result, metadata);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAttempt(Long actor, String event, String resource, Long resourceId,
                              Long childId, Long professionalId, String result, String metadata) {
        if (!ATTEMPT_RESULTS.contains(result)) throw new IllegalArgumentException("Resultado de tentativa inválido");
        save(actor, event, resource, resourceId, childId, professionalId, result, metadata);
    }

    private void save(Long actor, String event, String resource, Long resourceId, Long childId,
                      Long professionalId, String result, String metadata) {
        var request = currentRequest();
        repository.save(new AuditLog(actor, event, resource, resourceId, childId, professionalId,
                request == null ? null : ip(request),
                request == null ? null : request.getHeader("User-Agent"), result, metadata));
    }
    private HttpServletRequest currentRequest() {
        var attributes = RequestContextHolder.getRequestAttributes();
        return attributes instanceof ServletRequestAttributes servlet ? servlet.getRequest() : null;
    }
    private String ip(HttpServletRequest request) {
        var forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",", 2)[0].trim();
    }
}
