package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.conectatea.anotacao.application.AnotacaoService;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.notificacao.infrastructure.NotificacaoRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.VinculoProfissionalCrianca;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class AnotacaoNotificationIntegrationTest extends PostgresIntegrationTest {
    @Autowired AnotacaoService anotacoes;
    @Autowired UsuarioRepository usuarios;
    @Autowired ProfissionalRepository profissionais;
    @Autowired CriancaRepository criancas;
    @Autowired VinculoProfissionalRepository vinculosProfissionais;
    @Autowired VinculoResponsavelRepository vinculosResponsaveis;
    @Autowired NotificacaoRepository notificacoes;

    @Test
    void joaoNaoRecebeEAnaCarlosPaulaRecebemUmaNotificacao() {
        var joao = usuario("João", "joao-integracao@test.local", TipoUsuario.PROFISSIONAL);
        var ana = usuario("Ana", "ana-integracao@test.local", TipoUsuario.PROFISSIONAL);
        var carlos = usuario("Carlos", "carlos-integracao@test.local", TipoUsuario.PROFISSIONAL);
        var paula = usuario("Paula", "paula-integracao@test.local", TipoUsuario.RESPONSAVEL);
        var joaoProfissional = profissionais.save(new Profissional(joao.getId(), "JOAO-INT"));
        var anaProfissional = profissionais.save(new Profissional(ana.getId(), "ANA-INT"));
        var carlosProfissional = profissionais.save(new Profissional(carlos.getId(), "CARLOS-INT"));
        var maria = criancas.save(new Crianca("Maria", LocalDate.of(2018, 1, 1),
                null, null, null, null));
        vinculosProfissionais.save(new VinculoProfissionalCrianca(joaoProfissional.getId(), maria.getId()));
        vinculosProfissionais.save(new VinculoProfissionalCrianca(anaProfissional.getId(), maria.getId()));
        vinculosProfissionais.save(new VinculoProfissionalCrianca(carlosProfissional.getId(), maria.getId()));
        vinculosResponsaveis.save(new VinculoResponsavelCrianca(paula.getId(), maria.getId()));

        anotacoes.criar(new AuthenticatedUser(joao.getId(), joao.getEmail(), joao.getTipo()),
                maria.getId(), "Conteúdo clínico que não pode sair da plataforma",
                VisibilidadeAnotacao.COMPARTILHADA);

        assertThat(notificacoes.countByDestinatarioUsuarioIdAndLidaFalse(joao.getId())).isZero();
        assertThat(notificacoes.countByDestinatarioUsuarioIdAndLidaFalse(ana.getId())).isOne();
        assertThat(notificacoes.countByDestinatarioUsuarioIdAndLidaFalse(carlos.getId())).isOne();
        assertThat(notificacoes.countByDestinatarioUsuarioIdAndLidaFalse(paula.getId())).isOne();
        assertThat(notificacoes.findAll()).allSatisfy(item ->
                assertThat(item.getMensagem()).doesNotContain("Conteúdo clínico"));
    }

    private Usuario usuario(String nome, String email, TipoUsuario tipo) {
        return usuarios.save(new Usuario(nome, email, "hash", null, null, tipo));
    }
}
