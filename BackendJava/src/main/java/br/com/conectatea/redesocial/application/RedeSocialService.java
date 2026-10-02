package br.com.conectatea.redesocial.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.redesocial.api.RedeSocialDtos.*;
import br.com.conectatea.redesocial.domain.RedeSocial;
import br.com.conectatea.redesocial.infrastructure.RedeSocialRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RedeSocialService {
    private final RedeSocialRepository repository; private final ProfissionalRepository professionals; private final AuditLogService audit;
    public RedeSocialService(RedeSocialRepository repository, ProfissionalRepository professionals, AuditLogService audit) { this.repository = repository; this.professionals = professionals; this.audit = audit; }
    public List<Response> list(Long userId) { return repository.findByProfissionalIdOrderByTipoAsc(professionalId(userId)).stream().map(Response::from).toList(); }
    @Transactional public Response create(Long userId, CreateRequest request) { var professionalId = professionalId(userId); var saved = repository.save(new RedeSocial(professionalId, request.tipo(), request.url())); audit.record(userId, "REDE_SOCIAL_CRIADA", "REDE_SOCIAL", saved.getId(), null, professionalId, "SUCESSO", null); return Response.from(saved); }
    @Transactional public Response update(Long userId, Long id, UpdateRequest request) { var professionalId = professionalId(userId); var rede = owned(id, professionalId); rede.update(request.tipo(), request.url()); audit.record(userId, "REDE_SOCIAL_ATUALIZADA", "REDE_SOCIAL", id, null, professionalId, "SUCESSO", null); return Response.from(rede); }
    @Transactional public void delete(Long userId, Long id) { var professionalId = professionalId(userId); repository.delete(owned(id, professionalId)); audit.record(userId, "REDE_SOCIAL_REMOVIDA", "REDE_SOCIAL", id, null, professionalId, "SUCESSO", null); }
    private Long professionalId(Long userId) { return professionals.findByUsuarioId(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil profissional não encontrado")).getId(); }
    private RedeSocial owned(Long id, Long professionalId) { return repository.findByIdAndProfissionalId(id, professionalId).orElseThrow(() -> repository.existsById(id) ? new AccessDeniedException("Recurso pertence a outro profissional") : new ResponseStatusException(HttpStatus.NOT_FOUND, "Rede social não encontrada")); }
}
