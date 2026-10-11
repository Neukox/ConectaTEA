package br.com.conectatea.dashboard.api;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard/feed")
public class DashboardFeedController {
    private final JdbcTemplate jdbc; private final CriancaRepository children; private final ProfissionalRepository professionals;
    public DashboardFeedController(JdbcTemplate jdbc,CriancaRepository children,ProfissionalRepository professionals){this.jdbc=jdbc;this.children=children;this.professionals=professionals;}
    @GetMapping
    public FeedController.Page list(Authentication authentication,@RequestParam(defaultValue="5") @Min(1) @Max(5) int size,@RequestParam(required=false) Instant antes,@RequestParam(required=false) Long antesId){
        if((antes==null)!=(antesId==null))throw new IllegalArgumentException("antes e antesId devem ser informados juntos");
        var user=(AuthenticatedUser)authentication.getPrincipal();
        List<Long> ids=user.tipo()==TipoUsuario.PROFISSIONAL
                ?children.findLinkedToProfessional(professionals.findByUsuarioId(user.id()).orElseThrow().getId()).stream().map(Crianca::getId).toList()
                :children.findLinkedToGuardian(user.id()).stream().map(Crianca::getId).toList();
        if(ids.isEmpty())return new FeedController.Page(List.of(),false,null,null);
        var placeholders=String.join(",",Collections.nCopies(ids.size(),"?"));
        var sql="SELECT criado_em instante,recurso_id,tipo,recurso_tipo,titulo,resumo,id FROM eventos_feed e WHERE compartilhado=true AND crianca_id IN ("+placeholders+") AND (visibilidade='CIRCULO' OR (visibilidade='GESTORES' AND EXISTS (SELECT 1 FROM vinculos_responsaveis_criancas v WHERE v.crianca_id=e.crianca_id AND v.responsavel_id=? AND v.status='VINCULADO' AND v.papel='RESPONSAVEL_GESTOR')))";
        var args=new ArrayList<Object>(ids);args.add(user.id());
        if(antes!=null){sql+=" AND (criado_em < ? OR (criado_em = ? AND id < ?))";args.add(Timestamp.from(antes));args.add(Timestamp.from(antes));args.add(antesId);}
        sql+=" ORDER BY criado_em DESC,id DESC LIMIT ?";args.add(size+1);
        var items=jdbc.query(sql,(rs,n)->new FeedController.Item(rs.getString("tipo"),rs.getString("recurso_tipo"),rs.getLong("recurso_id"),rs.getString("titulo"),rs.getString("resumo"),rs.getTimestamp("instante").toInstant(),rs.getLong("id")),args.toArray());
        var more=items.size()>size;if(more)items=new ArrayList<>(items.subList(0,size));var last=more&&!items.isEmpty()?items.get(items.size()-1):null;
        return new FeedController.Page(items,more,last==null?null:last.instante(),last==null?null:last.id());
    }
}
