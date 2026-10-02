package br.com.conectatea.localatendimento.application;

import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.localatendimento.api.LocalAtendimentoDtos.*;
import br.com.conectatea.localatendimento.domain.LocalAtendimento;
import br.com.conectatea.localatendimento.infrastructure.LocalAtendimentoRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LocalAtendimentoService {
    private final LocalAtendimentoRepository repository;
    private final ProfissionalRepository professionals;
    private final AuditLogService audit;
    public LocalAtendimentoService(LocalAtendimentoRepository repository, ProfissionalRepository professionals, AuditLogService audit) { this.repository = repository; this.professionals = professionals; this.audit = audit; }
    public List<Response> list(Long userId) { return repository.findByProfissionalIdOrderByNomeAsc(professionalId(userId)).stream().map(Response::from).toList(); }
    @Transactional public Response create(Long userId, CreateRequest request) { var professionalId = professionalId(userId); var saved = repository.save(new LocalAtendimento(professionalId, request.nome(), request.cidade())); audit.record(userId, "LOCAL_ATENDIMENTO_CRIADO", "LOCAL_ATENDIMENTO", saved.getId(), null, professionalId, "SUCESSO", null); return Response.from(saved); }
    @Transactional public Response update(Long userId, Long id, UpdateRequest request) { var professionalId = professionalId(userId); var local = owned(id, professionalId); local.update(request.nome(), request.cidade()); audit.record(userId, "LOCAL_ATENDIMENTO_ATUALIZADO", "LOCAL_ATENDIMENTO", id, null, professionalId, "SUCESSO", null); return Response.from(local); }
    @Transactional public void delete(Long userId, Long id) { var professionalId = professionalId(userId); repository.delete(owned(id, professionalId)); audit.record(userId, "LOCAL_ATENDIMENTO_REMOVIDO", "LOCAL_ATENDIMENTO", id, null, professionalId, "SUCESSO", null); }
    private Long professionalId(Long userId) { return professionals.findByUsuarioId(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil profissional não encontrado")).getId(); }
    private LocalAtendimento owned(Long id, Long professionalId) { return repository.findByIdAndProfissionalId(id, professionalId).orElseThrow(() -> repository.existsById(id) ? new AccessDeniedException("Recurso pertence a outro profissional") : new ResponseStatusException(HttpStatus.NOT_FOUND, "Local de atendimento não encontrado")); }
}
