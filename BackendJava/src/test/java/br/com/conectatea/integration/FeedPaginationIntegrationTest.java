package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.dashboard.api.DashboardFeedController;
import br.com.conectatea.dashboard.api.FeedController;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

class FeedPaginationIntegrationTest extends PostgresIntegrationTest {
    @Autowired JdbcTemplate jdbc;

    @BeforeEach
    void clean() {
        jdbc.update("delete from eventos_feed");
        jdbc.update("delete from vinculos_responsaveis_criancas");
        jdbc.update("delete from criancas");
        jdbc.update("delete from usuarios");
    }

    @Test
    void separaIdDoEventoDoRecursoEPaginaPorInstanteEId() {
        var ids=seed(false);
        var authorization=mock(AuthorizationService.class);
        var controller=new FeedController(jdbc,authorization);
        var first=controller.list(auth(ids.userId()),ids.childId(),2,null,null);

        assertThat(first.items()).extracting(FeedController.Item::recursoId).containsExactly(77L,77L);
        assertThat(first.items()).extracting(FeedController.Item::recursoTipo).containsExactly("ANOTACAO","SESSAO");
        assertThat(first.items()).extracting(FeedController.Item::id).doesNotContain(77L);
        assertThat(first.hasMore()).isTrue();

        var second=controller.list(auth(ids.userId()),ids.childId(),2,first.nextAntes(),first.nextAntesId());
        assertThat(second.items()).hasSize(1);
        assertThat(second.items().getFirst().recursoId()).isEqualTo(55L);
    }

    @Test
    void eventoGestoresSoApareceAoGestorAtualInclusiveNoAgregado() {
        var manager=seed(true);
        var child=child(manager.childId());
        var otherChildId=jdbc.queryForObject("insert into criancas(nome,data_nascimento) values ('Outra criança','2019-01-01') returning id",Long.class);
        jdbc.update("insert into vinculos_responsaveis_criancas(responsavel_id,crianca_id,status,papel) values (?,?, 'VINCULADO','RESPONSAVEL')",manager.userId(),otherChildId);
        jdbc.update("insert into eventos_feed(crianca_id,tipo,recurso_tipo,recurso_id,titulo,compartilhado,visibilidade) values (?,'MEMBRO_REMOVIDO','VINCULO_RESPONSAVEL',88,'Restrito',true,'GESTORES')",otherChildId);
        var children=mock(CriancaRepository.class);
        when(children.findLinkedToGuardian(manager.userId())).thenReturn(List.of(child,child(otherChildId)));
        var dashboard=new DashboardFeedController(jdbc,children,mock(ProfissionalRepository.class));
        assertThat(dashboard.list(auth(manager.userId()),5,null,null).items())
                .extracting(FeedController.Item::tipo).contains("GESTAO_TRANSFERIDA");
        assertThat(dashboard.list(auth(manager.userId()),5,null,null).items())
                .extracting(FeedController.Item::tipo).doesNotContain("MEMBRO_REMOVIDO");

        var individual=new FeedController(jdbc,mock(AuthorizationService.class));
        assertThat(individual.list(professionalAuth(999L),manager.childId(),10,null,null).items())
                .extracting(FeedController.Item::tipo).doesNotContain("GESTAO_TRANSFERIDA");

        jdbc.update("update vinculos_responsaveis_criancas set papel='RESPONSAVEL' where responsavel_id=?",manager.userId());
        assertThat(dashboard.list(auth(manager.userId()),5,null,null).items())
                .extracting(FeedController.Item::tipo).doesNotContain("GESTAO_TRANSFERIDA");
    }

    private Seed seed(boolean manager) {
        var user=jdbc.queryForObject("insert into usuarios(nome,email,password_hash,tipo) values ('Pessoa',concat('p',nextval('usuarios_id_seq'),'@test'), 'hash','RESPONSAVEL') returning id",Long.class);
        var child=jdbc.queryForObject("insert into criancas(nome,data_nascimento) values ('Criança','2018-01-01') returning id",Long.class);
        jdbc.update("insert into vinculos_responsaveis_criancas(responsavel_id,crianca_id,status,papel) values (?,?, 'VINCULADO',?)",user,child,manager?"RESPONSAVEL_GESTOR":"RESPONSAVEL");
        var at=Instant.parse("2026-02-10T12:00:00Z");
        jdbc.update("insert into eventos_feed(crianca_id,tipo,recurso_tipo,recurso_id,titulo,compartilhado,criado_em,visibilidade) values (?,?,?,?,?,true,?,'CIRCULO')",child,"META_CRIADA","META",55L,"Meta",java.sql.Timestamp.from(at));
        jdbc.update("insert into eventos_feed(crianca_id,tipo,recurso_tipo,recurso_id,titulo,compartilhado,criado_em,visibilidade) values (?,?,?,?,?,true,?,'CIRCULO')",child,"SESSAO_AGENDADA","SESSAO",77L,"Sessão",java.sql.Timestamp.from(at));
        jdbc.update("insert into eventos_feed(crianca_id,tipo,recurso_tipo,recurso_id,titulo,compartilhado,criado_em,visibilidade) values (?,?,?,?,?,true,?,'CIRCULO')",child,"ANOTACAO_COMPARTILHADA","ANOTACAO",77L,"Anotação",java.sql.Timestamp.from(at));
        jdbc.update("insert into eventos_feed(crianca_id,tipo,recurso_tipo,recurso_id,titulo,compartilhado,criado_em,visibilidade) values (?,?,?,?,?,true,?,'GESTORES')",child,"GESTAO_TRANSFERIDA","ANOTACAO",77L,"Gestão",java.sql.Timestamp.from(at));
        return new Seed(user,child);
    }

    private Authentication auth(Long id){var auth=mock(Authentication.class);when(auth.getPrincipal()).thenReturn(new AuthenticatedUser(id,"p@test",TipoUsuario.RESPONSAVEL));return auth;}
    private Authentication professionalAuth(Long id){var auth=mock(Authentication.class);when(auth.getPrincipal()).thenReturn(new AuthenticatedUser(id,"pro@test",TipoUsuario.PROFISSIONAL));return auth;}
    private Crianca child(Long id){var child=new Crianca("Criança",LocalDate.of(2018,1,1),null,null,null,null);ReflectionTestUtils.setField(child,"id",id);return child;}
    private record Seed(Long userId,Long childId){}
}
