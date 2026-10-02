package br.com.conectatea.areaatuacao.application;

import br.com.conectatea.areaatuacao.api.AreaAtuacaoDtos.Response;
import br.com.conectatea.areaatuacao.domain.AreaAtuacaoProfissional;
import br.com.conectatea.areaatuacao.domain.AreaAtuacaoProfissionalId;
import br.com.conectatea.areaatuacao.infrastructure.AreaAtuacaoProfissionalRepository;
import br.com.conectatea.areaatuacao.infrastructure.AreaAtuacaoRepository;
import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AreaAtuacaoService {
    private final AreaAtuacaoRepository areas; private final AreaAtuacaoProfissionalRepository links; private final ProfissionalRepository professionals; private final AuditLogService audit;
    public AreaAtuacaoService(AreaAtuacaoRepository areas, AreaAtuacaoProfissionalRepository links, ProfissionalRepository professionals, AuditLogService audit) { this.areas = areas; this.links = links; this.professionals = professionals; this.audit = audit; }
    public List<Response> catalog() { return areas.findAllByOrderByNomeAsc().stream().map(Response::from).toList(); }
    public List<Response> mine(Long userId) { var ids = links.findByProfissionalId(professionalId(userId)).stream().map(AreaAtuacaoProfissional::getAreaId).toList(); return areas.findAllById(ids).stream().sorted((a,b) -> a.getNome().compareToIgnoreCase(b.getNome())).map(Response::from).toList(); }
    @Transactional public Response link(Long userId, Long areaId) { var professionalId = professionalId(userId); var area = areas.findById(areaId).orElseThrow(NoSuchElementException::new); var id = new AreaAtuacaoProfissionalId(professionalId, areaId); if (!links.existsById(id)) { links.save(new AreaAtuacaoProfissional(professionalId, areaId)); audit.record(userId, "AREA_ATUACAO_VINCULADA", "AREA_ATUACAO", areaId, null, professionalId, "SUCESSO", null); } return Response.from(area); }
    @Transactional public void unlink(Long userId, Long areaId) { var professionalId = professionalId(userId); var id = new AreaAtuacaoProfissionalId(professionalId, areaId); if (!links.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo com área de atuação não encontrado"); links.deleteById(id); audit.record(userId, "AREA_ATUACAO_DESVINCULADA", "AREA_ATUACAO", areaId, null, professionalId, "SUCESSO", null); }
    private Long professionalId(Long userId) { return professionals.findByUsuarioId(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil profissional não encontrado")).getId(); }
}
