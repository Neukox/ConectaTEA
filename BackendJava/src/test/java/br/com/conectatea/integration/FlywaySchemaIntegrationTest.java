package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.util.List;
import java.sql.DriverManager;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

class FlywaySchemaIntegrationTest extends PostgresIntegrationTest {
    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private UsuarioRepository usuarios;

    @Test
    void flywayCreatesTargetSchemaFromZero() {
        List<String> tables = jdbc.queryForList(
                "select table_name from information_schema.tables where table_schema = 'public'",
                String.class);
        assertThat(tables).contains(
                "usuarios", "profissionais", "criancas", "tokens_vinculo",
                "metas", "progressos", "sessoes", "audit_logs",
                "locais_atendimento", "redes_sociais", "areas_atuacao",
                "areas_atuacao_profissionais", "password_reset_tokens");
        assertThat(tables).contains("anotacoes", "notificacoes");

        List<String> userColumns=jdbc.queryForList(
                "select column_name from information_schema.columns where table_schema='public' and table_name='usuarios'",
                String.class);
        assertThat(userColumns).contains("credentials_updated_at");

        var supportType = jdbc.queryForObject("""
                select data_type from information_schema.columns
                where table_schema='public' and table_name='criancas' and column_name='nivel_suporte'
                """, String.class);
        assertThat(supportType).isEqualTo("smallint");
        var ufType = jdbc.queryForObject("""
                select data_type from information_schema.columns
                where table_schema='public' and table_name='criancas' and column_name='uf'
                """, String.class);
        assertThat(ufType).isEqualTo("character varying");
    }

    @Test
    void upgradesLegacyProgressStatusesWithoutLosingAlertMeaning() throws Exception {
        var schema = "upgrade_" + UUID.randomUUID().toString().replace("-", "");
        var base = Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .schemas(schema).defaultSchema(schema).createSchemas(true)
                .target("7").load();
        base.migrate();

        try (var connection = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
             var statement = connection.createStatement()) {
            statement.execute("set search_path to " + schema);
            statement.execute("insert into usuarios(nome,email,password_hash,tipo) values ('P','p@t.local','h','PROFISSIONAL')");
            statement.execute("insert into profissionais(usuario_id) values (1)");
            statement.execute("insert into criancas(nome,data_nascimento) values ('C','2018-01-01')");
            statement.execute("insert into metas(titulo,categoria,prioridade,status,data_inicio,data_fim,crianca_id,profissional_id) values ('M','COMUNICACAO','MEDIA','VENCENDO','2026-01-01','2026-12-01',1,1)");
            statement.execute("insert into progressos(meta_id,profissional_id,progresso_anterior,progresso_atual,status) values (1,1,10,20,'VENCENDO'),(1,1,20,90,'QUASE_CONCLUIDA'),(1,1,90,100,'CONCLUIDA')");
        }

        Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .schemas(schema).defaultSchema(schema).load().migrate();

        try (var connection = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
             var statement = connection.createStatement()) {
            statement.execute("set search_path to " + schema);
            var result = statement.executeQuery("select status,status_legado from progressos order by id");
            assertThat(result.next()).isTrue(); assertThat(result.getString(1)).isEqualTo("EM_ANDAMENTO"); assertThat(result.getString(2)).isEqualTo("VENCENDO");
            assertThat(result.next()).isTrue(); assertThat(result.getString(1)).isEqualTo("EM_ANDAMENTO"); assertThat(result.getString(2)).isEqualTo("QUASE_CONCLUIDA");
            assertThat(result.next()).isTrue(); assertThat(result.getString(1)).isEqualTo("CONCLUIDA"); assertThat(result.getString(2)).isNull();
        }
    }

    @Test
    @Transactional
    void emailUniqueIndexIsCaseInsensitive() {
        usuarios.saveAndFlush(new Usuario(
                "Primeira", "familia@example.com", "hash", null, null,
                TipoUsuario.RESPONSAVEL));

        assertThatThrownBy(() -> usuarios.saveAndFlush(new Usuario(
                "Segunda", "FAMILIA@example.com", "hash", null, null,
                TipoUsuario.RESPONSAVEL)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void tipoUsuarioConstraintRejectsUnknownValue() {
        assertThatThrownBy(() -> jdbc.update("""
                insert into usuarios (nome, email, password_hash, tipo)
                values ('Inválido', 'invalido@example.com', 'hash', 'ADMIN')
                """))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @Transactional
    void jpaQueryUsesPostgresqlCaseInsensitiveLookup() {
        usuarios.saveAndFlush(new Usuario(
                "Responsável", "responsavel@example.com", "hash", null, null,
                TipoUsuario.RESPONSAVEL));

        assertThat(usuarios.findByEmailIgnoreCase("RESPONSAVEL@EXAMPLE.COM"))
                .isPresent()
                .get()
                .extracting(Usuario::getTipo)
                .isEqualTo(TipoUsuario.RESPONSAVEL);
    }
}
