package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

class LatestProgressPostgresIntegrationTest extends PostgresIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired ProgressoRepository progressos;

    @Test
    @Transactional
    void bancoSelecionaMaiorIdQuandoDataEmpataSemCarregarHistorico() {
        var usuario = jdbc.queryForObject("""
                insert into usuarios(nome,email,password_hash,tipo)
                values ('Profissional','latest-progress@teste.local','hash','PROFISSIONAL') returning id
                """, Long.class);
        var profissional = jdbc.queryForObject(
                "insert into profissionais(usuario_id) values (?) returning id", Long.class, usuario);
        var crianca = jdbc.queryForObject("""
                insert into criancas(nome,data_nascimento) values ('Criança','2018-01-01') returning id
                """, Long.class);
        var meta = jdbc.queryForObject("""
                insert into metas(titulo,categoria,prioridade,status,data_inicio,data_fim,crianca_id,profissional_id)
                values ('Meta','COMUNICACAO','MEDIA','EM_ANDAMENTO','2026-01-01','2026-12-31',?,?) returning id
                """, Long.class, crianca, profissional);
        var instante = OffsetDateTime.parse("2026-02-10T12:00:00Z");
        var menorId = jdbc.queryForObject("""
                insert into progressos(meta_id,profissional_id,progresso_anterior,progresso_atual,status,data)
                values (?,?,0,30,'EM_ANDAMENTO',?) returning id
                """, Long.class, meta, profissional, instante);
        var maiorId = jdbc.queryForObject("""
                insert into progressos(meta_id,profissional_id,progresso_anterior,progresso_atual,status,data)
                values (?,?,30,75,'EM_ANDAMENTO',?) returning id
                """, Long.class, meta, profissional, instante);

        var latest = progressos.findLatestByMetaIdIn(java.util.List.of(meta));

        assertThat(latest).singleElement().satisfies(item -> {
            assertThat(item.getId()).isEqualTo(maiorId).isGreaterThan(menorId);
            assertThat(item.getProgressoAtual()).isEqualTo(75);
        });
    }
}
