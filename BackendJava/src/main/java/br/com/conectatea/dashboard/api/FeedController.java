package br.com.conectatea.dashboard.api;
import br.com.conectatea.security.*; import jakarta.validation.constraints.*; import java.sql.*; import java.time.Instant; import java.util.*; import org.springframework.jdbc.core.JdbcTemplate; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/criancas/{criancaId}/feed") @io.swagger.v3.oas.annotations.tags.Tag(name="Feed")
public class FeedController{
 private final JdbcTemplate jdbc; private final AuthorizationService authorization; public FeedController(JdbcTemplate j,AuthorizationService a){jdbc=j;authorization=a;}
    @GetMapping
    public Page list(Authentication authentication, @PathVariable Long criancaId,
            @RequestParam(defaultValue="10") @Min(1) @Max(50) int size,
            @RequestParam(required=false) Instant antes,
            @RequestParam(required=false) Long antesId) {
        authorization.requireCrianca((AuthenticatedUser)authentication.getPrincipal(), criancaId);
        if ((antes == null) != (antesId == null)) throw new IllegalArgumentException("antes e antesId devem ser informados juntos");
        
        String sql = """
            SELECT criado_em instante, id recurso_id, tipo, recurso_tipo, titulo, resumo, id
            FROM eventos_feed 
            WHERE crianca_id = ? AND compartilhado = true AND visibilidade='CIRCULO'
        """;
        
        List<Object> args = new ArrayList<>();
        args.add(criancaId);
        
        if (antes != null && antesId != null) {
            sql += " AND (criado_em < ? OR (criado_em = ? AND id < ?)) ";
            args.add(Timestamp.from(antes));
            args.add(Timestamp.from(antes));
            args.add(antesId);
        }
        
        sql += " ORDER BY criado_em DESC, id DESC LIMIT ? ";
        args.add(size + 1);
        
        var items = jdbc.query(sql, (rs, n) -> new Item(
            rs.getString("tipo"), 
            rs.getString("recurso_tipo"), 
            rs.getLong("recurso_id"), 
            rs.getString("titulo"), 
            rs.getString("resumo"), 
            rs.getTimestamp("instante").toInstant(),
            rs.getLong("id")
        ), args.toArray());
        
        var more = items.size() > size;
        if (more) items = new ArrayList<>(items.subList(0, size));
        
        Instant nextAntes = null;
        Long nextAntesId = null;
        if (more && !items.isEmpty()) {
            var last = items.get(items.size() - 1);
            nextAntes = last.instante();
            nextAntesId = last.id();
        }
        
        return new Page(items, more, nextAntes, nextAntesId);
    }

    public record Item(String tipo, String recursoTipo, Long recursoId, String titulo, String resumo, Instant instante, Long id){} 
    public record Page(List<Item> items, boolean hasMore, Instant nextAntes, Long nextAntesId){}
}
