package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.application.CirculoService;
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class CircleCompositionIntegrationTest extends PostgresIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired CirculoService service;
    @Autowired UsuarioRepository users;
    @Autowired CriancaRepository children;
    @Autowired ProfissionalRepository professionals;
    @Autowired VinculoResponsavelRepository guardians;
    @Autowired VinculoProfissionalRepository professionalLinks;

    @Test
    void httpReflectsActiveLinksIsolationTransferAndRevokedAccess() throws Exception {
        var manager = user("Zélia", TipoUsuario.RESPONSAVEL);
        var common = user("Ana", TipoUsuario.RESPONSAVEL);
        var outsider = user("Sem vínculo", TipoUsuario.RESPONSAVEL);
        var professionalUser = user("Bruna", TipoUsuario.PROFISSIONAL);
        var secondProfessionalUser = user("Ana Profissional", TipoUsuario.PROFISSIONAL);
        var professional = profile(professionalUser, "Psicologia", "/api/profissionais/fotos/bruna");
        var secondProfessional = profile(secondProfessionalUser, null, null);
        var child = child("Criança A");
        var otherChild = child("Criança B");

        var managerLink = new VinculoResponsavelCrianca(manager.getId(), child.getId());
        managerLink.informarParentesco("Mãe");
        managerLink.tornarGestor();
        guardians.save(managerLink);
        var commonLink = new VinculoResponsavelCrianca(common.getId(), child.getId());
        guardians.save(commonLink);
        var otherManagerLink = new VinculoResponsavelCrianca(outsider.getId(), otherChild.getId());
        otherManagerLink.tornarGestor();
        guardians.save(otherManagerLink);
        professionalLinks.save(new VinculoProfissionalCrianca(professional.getId(), child.getId()));

        mvc.perform(get("/criancas/{id}/circulo/membros", child.getId())
                        .with(authentication(auth(manager))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.criancaId").value(child.getId()))
                .andExpect(jsonPath("$.membros.length()").value(3))
                .andExpect(jsonPath("$.membros[0].papel").value("RESPONSAVEL_GESTOR"))
                .andExpect(jsonPath("$.membros[0].parentesco").value("Mãe"))
                .andExpect(jsonPath("$.membros[1].papel").value("RESPONSAVEL"))
                .andExpect(jsonPath("$.membros[2].especialidade").value("Psicologia"))
                .andExpect(jsonPath("$.membros[2].fotoPerfilUrl").value("/api/profissionais/fotos/bruna"));

        mvc.perform(get("/criancas/{id}/circulo/membros", child.getId())
                        .with(authentication(auth(outsider))))
                .andExpect(status().isForbidden());
        mvc.perform(get("/criancas/{id}/circulo/membros", otherChild.getId())
                        .with(authentication(auth(outsider))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.membros.length()").value(1));

        var entered = professionalLinks.save(
                new VinculoProfissionalCrianca(secondProfessional.getId(), child.getId()));
        assertThat(service.members(principal(manager), child.getId()).membros()).hasSize(4);
        service.leave(principal(secondProfessionalUser), child.getId());
        assertThat(service.members(principal(manager), child.getId()).membros()).hasSize(3);
        mvc.perform(get("/criancas/{id}/circulo/membros", child.getId())
                        .with(authentication(auth(secondProfessionalUser))))
                .andExpect(status().isForbidden());

        service.transferManagement(principal(manager), child.getId(), common.getId());
        var afterTransfer = service.members(principal(common), child.getId());
        assertThat(afterTransfer.membros()).filteredOn(member -> member.usuarioId().equals(common.getId()))
                .singleElement().satisfies(member -> assertThat(member.papel().name())
                        .isEqualTo("RESPONSAVEL_GESTOR"));
        assertThat(afterTransfer.membros()).filteredOn(member -> member.usuarioId().equals(manager.getId()))
                .singleElement().satisfies(member -> {
                    assertThat(member.papel().name()).isEqualTo("RESPONSAVEL");
                    assertThat(member.acoesPermitidas().podeTransferirGestao()).isTrue();
                });
        assertThat(entered.getId()).isNotNull();
    }

    @Test
    void openApiPublishesCircleFieldsAndAuthorizationResponses() throws Exception {
        var document = mvc.perform(get("/v3/api-docs")).andReturn().getResponse().getContentAsString();

        assertThat(document)
                .contains("/criancas/{criancaId}/circulo/membros")
                .contains("MemberResponse")
                .contains("fotoPerfilUrl")
                .contains("especialidade")
                .contains("parentesco")
                .contains("acoesPermitidas")
                .contains("Usuário sem vínculo ativo");
    }

    private Usuario user(String name, TipoUsuario type) {
        return users.save(new Usuario(name, "circle-" + System.nanoTime() + "@example.test",
                "hash", null, null, type));
    }

    private Profissional profile(Usuario user, String specialty, String photo) {
        var profile = new Profissional(user.getId(), "CIRCLE-" + System.nanoTime());
        profile.update(specialty, null, null, null, null, photo);
        return professionals.save(profile);
    }

    private Crianca child(String name) {
        return children.save(new Crianca(name, LocalDate.of(2018, 1, 1), null, null, null, null));
    }

    private AuthenticatedUser principal(Usuario user) {
        return new AuthenticatedUser(user.getId(), user.getEmail(), user.getTipo());
    }

    private UsernamePasswordAuthenticationToken auth(Usuario user) {
        return UsernamePasswordAuthenticationToken.authenticated(principal(user), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getTipo().name())));
    }
}
