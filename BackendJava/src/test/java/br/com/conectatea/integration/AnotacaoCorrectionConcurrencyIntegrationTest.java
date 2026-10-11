package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.anotacao.application.AnotacaoService;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class AnotacaoCorrectionConcurrencyIntegrationTest extends PostgresIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired AnotacaoService service;

    @BeforeEach
    void clean(){
        jdbc.update("delete from notificacoes");jdbc.update("delete from eventos_feed");
        jdbc.update("delete from versoes_anotacao");jdbc.update("delete from anotacoes");
        jdbc.update("delete from vinculos_profissionais_criancas");jdbc.update("delete from profissionais");
        jdbc.update("delete from criancas");jdbc.update("delete from usuarios");
    }

    @Test
    void duasCorrecoesSaoSerializadasSemPerderVersaoOuEvento() throws Exception {
        var seed=seed();
        var ready=new CountDownLatch(2);var start=new CountDownLatch(1);
        try(var executor=Executors.newFixedThreadPool(2)){
            var first=executor.submit(()->{ready.countDown();start.await();return service.atualizar(seed.actor(),seed.childId(),seed.noteId(),"Título A","Conteúdo corrigido pela tarefa A",VisibilidadeAnotacao.COMPARTILHADA,"tema-a","motivo A");});
            var second=executor.submit(()->{ready.countDown();start.await();return service.atualizar(seed.actor(),seed.childId(),seed.noteId(),"Título B","Conteúdo corrigido pela tarefa B",VisibilidadeAnotacao.COMPARTILHADA,"tema-b","motivo B");});
            assertThat(ready.await(5,TimeUnit.SECONDS)).isTrue();start.countDown();
            assertThat(first.get(15,TimeUnit.SECONDS)).isNotNull();
            assertThat(second.get(15,TimeUnit.SECONDS)).isNotNull();
        }
        var versions=jdbc.queryForList("select numero,conteudo from versoes_anotacao where anotacao_id=? order by numero",seed.noteId());
        assertThat(versions).extracting(v->((Number)v.get("numero")).intValue()).containsExactly(1,2);
        assertThat(versions.getFirst().get("conteudo")).isEqualTo("Conteúdo compartilhado original");
        var finalContent=jdbc.queryForObject("select conteudo from anotacoes where id=?",String.class,seed.noteId());
        assertThat(versions.get(1).get("conteudo")).isIn("Conteúdo corrigido pela tarefa A","Conteúdo corrigido pela tarefa B");
        assertThat(finalContent).isIn("Conteúdo corrigido pela tarefa A","Conteúdo corrigido pela tarefa B").isNotEqualTo(versions.get(1).get("conteudo"));
        assertThat(jdbc.queryForObject("select count(*) from eventos_feed where recurso_id=? and tipo='ANOTACAO_CORRIGIDA'",Integer.class,seed.noteId())).isEqualTo(2);
    }

    private Seed seed(){
        var user=jdbc.queryForObject("insert into usuarios(nome,email,password_hash,tipo) values ('Profissional','concorrencia@test','hash','PROFISSIONAL') returning id",Long.class);
        var professional=jdbc.queryForObject("insert into profissionais(usuario_id) values (?) returning id",Long.class,user);
        var child=jdbc.queryForObject("insert into criancas(nome,data_nascimento) values ('Criança','2018-01-01') returning id",Long.class);
        jdbc.update("insert into vinculos_profissionais_criancas(profissional_id,crianca_id,status,data_vinculo) values (?,?,'VINCULADO',now())",professional,child);
        var note=jdbc.queryForObject("insert into anotacoes(crianca_id,autor_profissional_id,titulo,conteudo,visibilidade,compartilhada_em,snapshot_crianca_id,snapshot_crianca_nome,snapshot_capturado_em,snapshot_origem) values (?,?,? ,?,'COMPARTILHADA',now(),?,? ,now(),'CRIACAO') returning id",Long.class,child,professional,"Título original","Conteúdo compartilhado original",child,"Criança");
        return new Seed(new AuthenticatedUser(user,"concorrencia@test",TipoUsuario.PROFISSIONAL),child,note);
    }
    private record Seed(AuthenticatedUser actor,Long childId,Long noteId){}
}
