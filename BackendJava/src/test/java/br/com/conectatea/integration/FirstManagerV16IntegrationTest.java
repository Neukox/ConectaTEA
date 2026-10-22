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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

class FirstManagerV16IntegrationTest extends PostgresIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager entityManager;
    @Autowired AdministracaoGestorController controller;
    @Autowired PlatformTransactionManager transactionManager;

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

    @Test
    @Transactional
    void recusaRegistraDecisaoEAuditoriaSemVinculoEventoOuAprovacaoPosterior() {
        var admin = usuario("Admin recusa", "admin-recusa@teste.local", true, true);
        var solicitante = usuario("Recusado", "recusado@teste.local", false, true);
        var crianca = crianca("Criança recusada", false);
        var pedido = pedido(crianca, solicitante);

        controller.decidir(auth(admin), pedido,
                new AdministracaoGestorController.Decision(false, "ref-recusa", "documento insuficiente"));
        entityManager.flush();

        assertThat(jdbc.queryForObject("select status from pedidos_primeiro_gestor where id=?", String.class, pedido))
                .isEqualTo("RECUSADO");
        assertThat(contagem("vinculos_responsaveis_criancas", crianca)).isZero();
        assertThat(contagemEvento(crianca)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from audit_logs where crianca_id=? and acao='PRIMEIRO_GESTOR_RECUSADO' and resultado='SUCESSO'", Long.class, crianca)).isOne();
        assertThatThrownBy(() -> controller.decidir(auth(admin), pedido,
                new AdministracaoGestorController.Decision(true, "ref", "tardia")))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    @Transactional
    void bloqueiaSolicitanteInativoNaoConfirmadoCriancaArquivadaEOperadorComum() {
        var admin = usuario("Admin elegibilidade", "admin-elegibilidade@teste.local", true, true);
        var inativo = usuario("Inativo", "inativo-v16@teste.local", false, true);
        jdbc.update("update usuarios set ativo=false where id=?", inativo);
        var semEmail = usuario("Sem email", "sem-email-v16@teste.local", false, false);
        var elegivel = usuario("Elegível", "elegivel-v16@teste.local", false, true);
        var operadorComum = usuario("Operador comum", "operador-comum@teste.local", false, true);
        var ativa1 = crianca("Ativa 1", false);
        var ativa2 = crianca("Ativa 2", false);
        var arquivada = crianca("Arquivada", true);

        assertInelegivel(admin, pedido(ativa1, inativo));
        assertInelegivel(admin, pedido(ativa2, semEmail));
        assertInelegivel(admin, pedido(arquivada, elegivel));
        assertThatThrownBy(() -> controller.decidir(auth(operadorComum), pedido(crianca("Sem admin", false), elegivel),
                new AdministracaoGestorController.Decision(true, "ref", "motivo")))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void falhaDepoisDasAlteracoesReverteTudoEVerificacaoOcorreEmNovaTransacao() {
        var tx = new TransactionTemplate(transactionManager);
        var ids = tx.execute(status -> {
            var admin = usuario("Admin rollback", "admin-rollback@teste.local", true, true);
            var solicitante = usuario("Rollback", "rollback-v16@teste.local", false, true);
            var crianca = crianca("Criança rollback", false);
            return new Long[]{admin, solicitante, crianca, pedido(crianca, solicitante)};
        });
        tx.executeWithoutResult(status -> jdbc.execute("""
                create function falhar_auditoria_primeiro_gestor() returns trigger language plpgsql as $$
                begin
                  if NEW.acao='PRIMEIRO_GESTOR_APROVADO' then raise exception 'falha provocada após alterações'; end if;
                  return NEW;
                end $$;
                create trigger trg_falhar_auditoria_primeiro_gestor before insert on audit_logs
                for each row execute function falhar_auditoria_primeiro_gestor();
                """));
        try {
            assertThatThrownBy(() -> tx.executeWithoutResult(status ->
                    controller.decidir(auth(ids[0]), ids[3],
                            new AdministracaoGestorController.Decision(true, "ref-rollback", "motivo rollback"))))
                    .isInstanceOf(RuntimeException.class);

            tx.executeWithoutResult(status -> {
                assertThat(jdbc.queryForObject("select status from pedidos_primeiro_gestor where id=?", String.class, ids[3])).isEqualTo("PENDENTE");
                assertThat(contagem("vinculos_responsaveis_criancas", ids[2])).isZero();
                assertThat(jdbc.queryForObject("select count(*) from historico_vinculos where crianca_id=? and evento='PRIMEIRO_GESTOR_APROVADO'", Long.class, ids[2])).isZero();
                assertThat(contagemEvento(ids[2])).isZero();
                assertThat(jdbc.queryForObject("select count(*) from audit_logs where crianca_id=? and acao='PRIMEIRO_GESTOR_APROVADO'", Long.class, ids[2])).isZero();
            });
        } finally {
            tx.executeWithoutResult(status -> jdbc.execute("drop trigger if exists trg_falhar_auditoria_primeiro_gestor on audit_logs; drop function if exists falhar_auditoria_primeiro_gestor()"));
        }
    }

    private void assertInelegivel(Long admin, Long pedido) {
        var crianca = jdbc.queryForObject("select crianca_id from pedidos_primeiro_gestor where id=?", Long.class, pedido);
        assertThatThrownBy(() -> controller.decidir(auth(admin), pedido,
                new AdministracaoGestorController.Decision(true, "ref", "motivo")))
                .isInstanceOf(BusinessRuleException.class);
        entityManager.clear();
        assertThat(jdbc.queryForObject("select status from pedidos_primeiro_gestor where id=?", String.class, pedido)).isEqualTo("PENDENTE");
        assertThat(contagem("vinculos_responsaveis_criancas", crianca)).isZero();
        assertThat(contagemEvento(crianca)).isZero();
    }

    private Long crianca(String nome, boolean arquivada) {
        return jdbc.queryForObject("insert into criancas(nome,data_nascimento,arquivada) values (?,'2018-01-01',?) returning id", Long.class, nome, arquivada);
    }

    private Long pedido(Long crianca, Long solicitante) {
        return jdbc.queryForObject("insert into pedidos_primeiro_gestor(crianca_id,solicitante_usuario_id,vinculo_declarado,responsavel_legal_declarado) values (?,?,'RESPONSAVEL',true) returning id", Long.class, crianca, solicitante);
    }

    private long contagem(String tabela, Long crianca) {
        return jdbc.queryForObject("select count(*) from " + tabela + " where crianca_id=?", Long.class, crianca);
    }

    private long contagemEvento(Long crianca) {
        return jdbc.queryForObject("select count(*) from eventos_feed where crianca_id=? and tipo='PRIMEIRO_GESTOR_APROVADO'", Long.class, crianca);
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
