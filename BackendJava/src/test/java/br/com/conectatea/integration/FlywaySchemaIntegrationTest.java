package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.util.List;
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
