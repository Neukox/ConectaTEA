package br.com.conectatea.dashboard.api;
import br.com.conectatea.security.*; import jakarta.validation.constraints.*; import java.sql.*; import java.time.Instant; import java.util.*; import org.springframework.jdbc.core.JdbcTemplate; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/criancas/{criancaId}/feed") @io.swagger.v3.oas.annotations.tags.Tag(name="Feed")
public class FeedController{
 private final JdbcTemplate jdbc; private final AuthorizationService authorization; public FeedController(JdbcTemplate j,AuthorizationService a){jdbc=j;authorization=a;}
 @GetMapping public Page list(Authentication authentication,@PathVariable Long criancaId,@RequestParam(defaultValue="10") @Min(1) @Max(50) int size,@RequestParam(defaultValue="0") @Min(0) int offset){authorization.requireCrianca((AuthenticatedUser)authentication.getPrincipal(),criancaId);var sql="""
 select * from (
  select m.created_at instante,m.id recurso_id,'META_CRIADA' tipo,'META' recurso_tipo,m.titulo titulo,null::text resumo from metas m where m.crianca_id=?
  union all select m.concluida_em,m.id,'META_CONCLUIDA','META',m.titulo,m.resumo_resultado from metas m where m.crianca_id=? and m.concluida_em is not null
  union all select m.reaberta_em,m.id,'META_REABERTA','META',m.titulo,null from metas m where m.crianca_id=? and m.reaberta_em is not null
  union all select p.data,p.id,'PROGRESSO_ATUALIZADO','PROGRESSO',m.titulo,p.descricao from progressos p join metas m on m.id=p.meta_id where m.crianca_id=?
  union all select s.created_at,s.id,'SESSAO_AGENDADA','SESSAO',coalesce(s.descricao,'Sessão agendada'),null from sessoes s where s.crianca_id=?
  union all select s.updated_at,s.id,case s.status when 'REALIZADA' then 'SESSAO_REALIZADA' else 'SESSAO_CANCELADA' end,'SESSAO',coalesce(s.descricao,'Sessão'),null from sessoes s where s.crianca_id=? and s.status in ('REALIZADA','CANCELADA')
  union all select coalesce(a.compartilhada_em,a.created_at),a.id,'ANOTACAO_COMPARTILHADA','ANOTACAO',a.titulo,null from anotacoes a where a.crianca_id=? and a.visibilidade='COMPARTILHADA'
  union all select h.created_at,h.id,h.evento,'GESTAO','Gestão do círculo',h.detalhes from historico_vinculos h where h.crianca_id=?
 ) e where instante is not null order by instante desc,recurso_id desc limit ? offset ?
 """;var items=jdbc.query(sql,(rs,n)->new Item(rs.getString("tipo"),rs.getString("recurso_tipo"),rs.getLong("recurso_id"),rs.getString("titulo"),rs.getString("resumo"),rs.getTimestamp("instante").toInstant()),criancaId,criancaId,criancaId,criancaId,criancaId,criancaId,criancaId,criancaId,size+1,offset);var more=items.size()>size;if(more)items=new ArrayList<>(items.subList(0,size));return new Page(items,more,more?offset+size:null);}
 public record Item(String tipo,String recursoTipo,Long recursoId,String titulo,String resumo,Instant instante){} public record Page(List<Item> items,boolean hasMore,Integer nextOffset){}
}
