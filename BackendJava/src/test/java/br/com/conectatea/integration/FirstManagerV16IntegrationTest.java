package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.shared.domain.BusinessRuleException;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.api.AdministracaoGestorController;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

class FirstManagerV16IntegrationTest extends PostgresIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager entityManager;
    @Autowired AdministracaoGestorController controller;

    @Test
    @Transactional
    void aprovacaoRealCriaVinculoHistoricoEUmEventoRestritoSemDadosAdministrativos() {
        var admin = usuario("Administrador", "admin-v16@teste.local", true, true);
        var solicitante = usuario("Responsável", "responsavel-v16@teste.local", false, true);
        var crianca = jdbc.queryForObject("""
                insert into criancas(nome,data_nascimento) values ('Criança V16','2018-01-01') returning id
                """, Long.class);
        var pedido = jdbc.queryForObject("""
                insert into pedidos_primeiro_gestor(crianca_id,solicitante_usuario_id,vinculo_declarado,responsavel_legal_declarado)
                values (?,?,'MÃE',true) returning id
                """, Long.class, crianca, solicitante);
        jdbc.update("""
                insert into eventos_feed(crianca_id,tipo,recurso_tipo,recurso_id,titulo,compartilhado,visibilidade)
                values (?,'FIXTURE','FIXTURE',999,'Fixture',true,'CIRCULO')
                """, crianca);

        controller.decidir(auth(admin), pedido,
                new AdministracaoGestorController.Decision(true, "prova-secreta-123", "motivo administrativo"));
        entityManager.flush();

        assertThat(jdbc.queryForObject("""
                select count(*) from vinculos_responsaveis_criancas
                where crianca_id=? and responsavel_id=? and status='VINCULADO' and papel='RESPONSAVEL_GESTOR'
                """, Long.class, crianca, solicitante)).isEqualTo(1L);
        assertThat(jdbc.queryForObject("""
                select count(*) from historico_vinculos
                where crianca_id=? and evento='PRIMEIRO_GESTOR_APROVADO'
                """, Long.class, crianca)).isEqualTo(1L);

        var evento = jdbc.queryForMap("""
                select e.id,e.recurso_id,e.tipo,e.visibilidade,e.titulo,e.resumo
                from eventos_feed e where e.crianca_id=? and e.tipo='PRIMEIRO_GESTOR_APROVADO'
                """, crianca);
        assertThat(evento.get("visibilidade")).isEqualTo("GESTORES");
        assertThat(evento.get("id")).isNotEqualTo(evento.get("recurso_id"));
        assertThat(evento.toString()).doesNotContain("prova-secreta-123", "motivo administrativo");

        assertThatThrownBy(() -> controller.decidir(auth(admin), pedido,
                new AdministracaoGestorController.Decision(true, "outra-prova", "repetição")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("decidido");
        assertThat(jdbc.queryForObject("""
                select count(*) from eventos_feed where crianca_id=? and tipo='PRIMEIRO_GESTOR_APROVADO'
                """, Long.class, crianca)).isEqualTo(1L);
    }

    private Long usuario(String nome, String email, boolean administrador, boolean confirmado) {
        return jdbc.queryForObject("""
                insert into usuarios(nome,email,password_hash,tipo,administrador,email_confirmado_em)
                values (?,?, 'hash','RESPONSAVEL',?,case when ? then now() else null end) returning id
                """, Long.class, nome, email, administrador, confirmado);
    }

    private Authentication auth(Long id) {
        var authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(
                new AuthenticatedUser(id, "admin-v16@teste.local", TipoUsuario.RESPONSAVEL));
        return authentication;
    }
}
