package br.com.conectatea.auditoria.application;
import br.com.conectatea.auditoria.domain.AuditLog;
import br.com.conectatea.auditoria.infrastructure.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
@Service public class AuditLogService {
 private static final Logger log=LoggerFactory.getLogger(AuditLogService.class); private final AuditLogRepository repository; private final ObjectProvider<HttpServletRequest> requests;
 public AuditLogService(AuditLogRepository repository,ObjectProvider<HttpServletRequest> requests){this.repository=repository;this.requests=requests;}
 @Transactional(propagation=Propagation.REQUIRES_NEW) public void record(Long actor,String event,String resource,Long resourceId,Long childId,Long professionalId,String result,String metadata){try{var request=requests.getIfAvailable();repository.save(new AuditLog(actor,event,resource,resourceId,childId,professionalId,request==null?null:ip(request),request==null?null:request.getHeader("User-Agent"),result,metadata));}catch(RuntimeException e){log.error("Falha ao persistir evento de auditoria {}",event,e);}}
 private String ip(HttpServletRequest request){var value=request.getHeader("X-Forwarded-For");return value==null||value.isBlank()?request.getRemoteAddr():value.split(",",2)[0].trim();}
}
