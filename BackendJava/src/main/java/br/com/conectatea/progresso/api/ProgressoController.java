package br.com.conectatea.progresso.api;
import br.com.conectatea.meta.domain.*; import br.com.conectatea.meta.infrastructure.MetaRepository; import br.com.conectatea.security.*; import java.util.*; import java.util.stream.Collectors; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/progresso") public class ProgressoController { private final MetaRepository metas; private final AuthorizationService authorization; public ProgressoController(MetaRepository m,AuthorizationService a){metas=m;authorization=a;}
 private List<Meta> allowed(Authentication a,Long child){authorization.requireCrianca((AuthenticatedUser)a.getPrincipal(),child);return metas.findByCriancaId(child);}
 @GetMapping("/resumo") public Map<String,Object> summary(Authentication a,@RequestParam Long criancaId){var all=allowed(a,criancaId);return Map.of("total",all.size(),"media",all.stream().mapToInt(Meta::getProgresso).average().orElse(0),"concluidas",all.stream().filter(m->m.getStatus()==StatusMeta.CONCLUIDA).count());}
 @GetMapping("/distribuicao-categoria") public Map<CategoriaMeta,Long> distribution(Authentication a,@RequestParam Long criancaId){return allowed(a,criancaId).stream().collect(Collectors.groupingBy(Meta::getCategoria,Collectors.counting()));}
 @GetMapping("/evolucao-categoria") public Map<CategoriaMeta,Double> evolution(Authentication a,@RequestParam Long criancaId){return allowed(a,criancaId).stream().collect(Collectors.groupingBy(Meta::getCategoria,Collectors.averagingInt(Meta::getProgresso)));}
 @GetMapping("/crianca") public List<?> child(Authentication a,@RequestParam Long criancaId){return allowed(a,criancaId);}
 @GetMapping("/recentes") public List<?> recent(Authentication a,@RequestParam Long criancaId){return allowed(a,criancaId).stream().sorted(Comparator.comparing(Meta::getUpdatedAt).reversed()).limit(10).toList();}
}
