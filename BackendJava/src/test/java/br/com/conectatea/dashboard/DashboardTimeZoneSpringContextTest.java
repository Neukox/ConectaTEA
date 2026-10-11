package br.com.conectatea.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.domain.StatusAcompanhamento;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.dashboard.api.DashboardController;
import br.com.conectatea.meta.infrastructure.MetaRepository;
import br.com.conectatea.notificacao.infrastructure.NotificacaoRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.progresso.application.LatestProgressService;
import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.sessao.domain.StatusSessao;
import br.com.conectatea.sessao.infrastructure.SessaoRepository;
import br.com.conectatea.shared.api.ApiExceptionHandler;
import br.com.conectatea.shared.time.LocalTimeZoneResolver;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class DashboardTimeZoneSpringContextTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(TimeZoneConfiguration.class);

    @Test
    void contextoInjetaManausEFallbackBahia() {
        runner.withPropertyValues("app.time-zone=America/Manaus").run(context ->
                assertThat(context.getBean(LocalTimeZoneResolver.class).resolve(null))
                        .isEqualTo(ZoneId.of("America/Manaus")));
        runner.run(context ->
                assertThat(context.getBean(LocalTimeZoneResolver.class).resolve(null))
                        .isEqualTo(ZoneId.of("America/Bahia")));
    }

    @Test
    void dashboardUsaConfiguracaoSemParametroEOverrideValidoPrevalece() {
        runner.withPropertyValues("app.time-zone=America/Manaus").run(context -> {
            var fixture = fixture(context.getBean(LocalTimeZoneResolver.class), Instant.parse("2026-02-02T03:30:00Z"));
            assertThat(fixture.controller.guardian(fixture.auth, null).fusoUtilizado()).isEqualTo("America/Manaus");
            assertThat(fixture.controller.guardian(fixture.auth, "America/Bahia").fusoUtilizado()).isEqualTo("America/Bahia");
        });
    }

    @Test
    void configuracaoInvalidaImpedeInicializacao() {
        runner.withPropertyValues("app.time-zone=Bahia/Brasil").run(context -> {
            assertThat(context).hasFailed();
            assertThat(context.getStartupFailure())
                    .hasStackTraceContaining("IllegalArgumentException: app.time-zone")
                    .hasStackTraceContaining("IANA");
        });
    }

    @Test
    void parametroInvalidoRetornaContratoHttp400() throws Exception {
        var fixture = fixture(new LocalTimeZoneResolver("America/Bahia"), Instant.parse("2026-02-02T03:30:00Z"));
        var mvc = MockMvcBuilders.standaloneSetup(fixture.controller)
                .setControllerAdvice(new ApiExceptionHandler()).build();

        mvc.perform(get("/dashboard/responsavel").param("timezone", "Bahia/Brasil")
                        .principal(fixture.auth))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"));
    }

    @Test
    void semanaNaViradaUsaFusoConfigurado() {
        runner.withPropertyValues("app.time-zone=America/Manaus").run(context -> {
            var fixture = fixture(context.getBean(LocalTimeZoneResolver.class), Instant.parse("2026-02-02T03:30:00Z"));
            var child = new Crianca("Criança", LocalDate.of(2018, 1, 1), null, null, null, null);
            ReflectionTestUtils.setField(child, "id", 7L);
            ReflectionTestUtils.setField(child, "statusAcompanhamento", StatusAcompanhamento.EM_ACOMPANHAMENTO);
            when(fixture.children.findLinkedToGuardian(20L)).thenReturn(List.of(child));
            when(fixture.metas.findByCriancaIdIn(List.of(7L))).thenReturn(List.of());

            fixture.controller.guardian(fixture.auth, null);

            var zone = ZoneId.of("America/Manaus");
            verify(fixture.sessions).countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                    eq(List.of(7L)), eq(StatusSessao.AGENDADA),
                    eq(LocalDate.of(2026, 1, 26).atStartOfDay(zone).toOffsetDateTime()),
                    eq(LocalDate.of(2026, 2, 2).atStartOfDay(zone).toOffsetDateTime()));
        });
    }

    private Fixture fixture(LocalTimeZoneResolver resolver, Instant instant) {
        var children = mock(CriancaRepository.class);
        var metas = mock(MetaRepository.class);
        var sessions = mock(SessaoRepository.class);
        var progress = mock(ProgressoRepository.class);
        var controller = new DashboardController(mock(ProfissionalRepository.class), children, metas, sessions,
                mock(VinculoProfissionalRepository.class), Clock.fixed(instant, ZoneOffset.UTC), resolver,
                new LatestProgressService(progress), mock(NotificacaoRepository.class));
        var auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(new AuthenticatedUser(20L, "responsavel@teste.local", TipoUsuario.RESPONSAVEL));
        when(children.findLinkedToGuardian(20L)).thenReturn(List.of());
        return new Fixture(controller, children, metas, sessions, auth);
    }

    @Configuration(proxyBeanMethods = false)
    @Import(LocalTimeZoneResolver.class)
    static class TimeZoneConfiguration {}

    private record Fixture(DashboardController controller, CriancaRepository children,
                           MetaRepository metas, SessaoRepository sessions, Authentication auth) {}
}
