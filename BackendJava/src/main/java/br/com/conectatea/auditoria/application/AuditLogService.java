package br.com.conectatea.auditoria.application;
import br.com.conectatea.auditoria.domain.AuditLog;
import br.com.conectatea.auditoria.infrastructure.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
@Service public class AuditLogService {
 private static final Logger log=LoggerFactory.getLogger(AuditLogService.class); private final AuditLogRepository repository;
 public AuditLogService(AuditLogRepository repository){this.repository=repository;}
 @Transactional(propagation=Propagation.REQUIRES_NEW) public void record(Long actor,String event,String resource,Long resourceId,Long childId,Long professionalId,String result,String metadata){try{var request=currentRequest();repository.save(new AuditLog(actor,event,resource,resourceId,childId,professionalId,request==null?null:ip(request),request==null?null:request.getHeader("User-Agent"),result,metadata));}catch(RuntimeException e){log.error("Falha ao persistir evento de auditoria {}",event,e);}}
 private HttpServletRequest currentRequest(){var attributes=RequestContextHolder.getRequestAttributes();return attributes instanceof ServletRequestAttributes servletAttributes?servletAttributes.getRequest():null;}
 private String ip(HttpServletRequest request){var value=request.getHeader("X-Forwarded-For");return value==null||value.isBlank()?request.getRemoteAddr():value.split(",",2)[0].trim();}
}
