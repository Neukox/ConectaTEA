package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.shared.domain.BusinessRuleException;
import br.com.conectatea.usuario.domain.*;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.application.ConviteNominalService;
import br.com.conectatea.vinculo.domain.*;
import br.com.conectatea.vinculo.infrastructure.*;
import java.time.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class NominalInviteIntegrationTest extends PostgresIntegrationTest {
    @Autowired ConviteNominalService service;
    @Autowired UsuarioRepository users;
    @Autowired CriancaRepository children;
    @Autowired ProfissionalRepository professionals;
    @Autowired VinculoResponsavelRepository guardians;
    @Autowired ConviteCirculoRepository invites;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;

    @Test
    void formerManagerReentersOnlyAsCommonGuardianAndTraceabilityIsAtomic() {
        var fixture=fixture();
        var former=guardian("antigo-gestor",true);
        var oldLink=new VinculoResponsavelCrianca(former.getId(),fixture.child().getId());
        oldLink.tornarGestor(); oldLink.desvincular(); guardians.save(oldLink);

        var issued=service.issue(principal(fixture.manager()),fixture.child().getId(),former.getEmail(),PapelCirculo.RESPONSAVEL);
        service.accept(principal(former),issued.token(),"127.0.0.1","integration-test");

        var reentered=guardians.findByResponsavelIdAndCriancaId(former.getId(),fixture.child().getId()).orElseThrow();
        assertThat(reentered.getStatus()).isEqualTo(StatusVinculo.VINCULADO);
        assertThat(reentered.getPapel()).isEqualTo(PapelCirculo.RESPONSAVEL);
        assertThat(count("select count(*) from consentimentos where responsavel_id=? and crianca_id=?",former.getId(),fixture.child().getId())).isEqualTo(1);
        assertThat(count("select count(*) from historico_vinculos where responsavel_id=? and evento='CONVITE_NOMINAL_ACEITO'",former.getId())).isEqualTo(1);
        assertThat(count("select count(*) from audit_logs where usuario_id=? and evento='CONVITE_NOMINAL_ACEITO'",former.getId())).isEqualTo(1);
    }

    @Test
    void expiredInviteIsReportedExpiredAndDoesNotBlockReplacement() {
        var fixture=fixture(); var recipient=guardian("destino-expirado",true);
        var first=service.issue(principal(fixture.manager()),fixture.child().getId(),recipient.getEmail(),PapelCirculo.RESPONSAVEL);
        jdbc.update("update convites_circulo set expira_em=now()-interval '1 minute' where id=?",first.id());

        assertThatThrownBy(()->service.accept(principal(recipient),first.token()))
                .isInstanceOf(BusinessRuleException.class).extracting("code").isEqualTo("INVITE_UNAVAILABLE");
        assertThat(service.mine(principal(recipient))).singleElement().extracting(ConviteNominalService.InviteView::status).isEqualTo("EXPIRADO");

        var replacement=service.issue(principal(fixture.manager()),fixture.child().getId(),recipient.getEmail(),PapelCirculo.RESPONSAVEL);
        assertThat(service.accept(principal(recipient),replacement.token()).status()).isEqualTo("ACEITO");
    }

    @Test
    void childListingUsesReadAuthorizationAndOnlyManagerCanCallApi() throws Exception {
        var fixture=fixture();
        var common=guardian("comum",true); guardians.save(new VinculoResponsavelCrianca(common.getId(),fixture.child().getId()));
        var professionalUser=new Usuario("Profissional",unique("prof"),"hash",null,null,TipoUsuario.PROFISSIONAL);professionalUser.confirmarEmail(Instant.now());professionalUser=users.save(professionalUser);
        var professional=professionals.save(new Profissional(professionalUser.getId(),"PROF-"+System.nanoTime()));
        var unrelated=guardian("sem-vinculo",true);

        mvc.perform(get("/vinculos/convites/criancas/{id}",fixture.child().getId()).with(authentication(auth(fixture.manager())))).andExpect(status().isOk());
        mvc.perform(get("/vinculos/convites/criancas/{id}",fixture.child().getId()).with(authentication(auth(common)))).andExpect(status().isForbidden());
        mvc.perform(get("/vinculos/convites/criancas/{id}",fixture.child().getId()).with(authentication(auth(professionalUser)))).andExpect(status().isForbidden());
        mvc.perform(get("/vinculos/convites/criancas/{id}",fixture.child().getId()).with(authentication(auth(unrelated)))).andExpect(status().isForbidden());
        assertThat(professional.getId()).isNotNull();
    }

    @Test
    void mandatoryHistoryFailureRollsBackAccessConsentAndInviteConsumption() {
        var fixture=fixture(); var recipient=guardian("rollback",true);
        var issued=service.issue(principal(fixture.manager()),fixture.child().getId(),recipient.getEmail(),PapelCirculo.RESPONSAVEL);
        jdbc.execute("create function fail_nominal_history() returns trigger language plpgsql as $$ begin if new.evento='CONVITE_NOMINAL_ACEITO' then raise exception 'synthetic history failure'; end if; return new; end $$");
        jdbc.execute("create trigger trg_fail_nominal_history before insert on historico_vinculos for each row execute function fail_nominal_history()");
        try {
            assertThatThrownBy(()->service.accept(principal(recipient),issued.token())).isInstanceOf(RuntimeException.class);
        } finally {
            jdbc.execute("drop trigger trg_fail_nominal_history on historico_vinculos");
            jdbc.execute("drop function fail_nominal_history()");
        }
        assertThat(guardians.findByResponsavelIdAndCriancaId(recipient.getId(),fixture.child().getId())).isEmpty();
        assertThat(count("select count(*) from consentimentos where responsavel_id=? and crianca_id=?",recipient.getId(),fixture.child().getId())).isZero();
        assertThat(invites.findById(issued.id()).orElseThrow().getStatus()).isEqualTo("PENDENTE_ACEITE");
    }

    private Fixture fixture(){var manager=guardian("gestor",true);var child=children.save(new Crianca("Criança",LocalDate.of(2018,1,1),null,null,null,null));var link=new VinculoResponsavelCrianca(manager.getId(),child.getId());link.tornarGestor();guardians.save(link);return new Fixture(manager,child);}
    private Usuario guardian(String prefix,boolean confirmed){var user=new Usuario(prefix,unique(prefix),"hash",null,null,TipoUsuario.RESPONSAVEL);if(confirmed)user.confirmarEmail(Instant.now());return users.save(user);}
    private long count(String sql,Object...args){return jdbc.queryForObject(sql,Long.class,args);}
    private AuthenticatedUser principal(Usuario u){return new AuthenticatedUser(u.getId(),u.getEmail(),u.getTipo());}
    private UsernamePasswordAuthenticationToken auth(Usuario u){return UsernamePasswordAuthenticationToken.authenticated(principal(u),null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getTipo().name())));}
    private String unique(String prefix){return prefix+"-"+System.nanoTime()+"@example.test";}
    private record Fixture(Usuario manager,Crianca child){}
}
