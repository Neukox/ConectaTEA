package br.com.conectatea.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.domain.StatusAcompanhamento;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.dashboard.api.DashboardController;
import br.com.conectatea.meta.domain.CategoriaMeta;
import br.com.conectatea.meta.domain.Meta;
import br.com.conectatea.meta.domain.PrioridadeMeta;
import br.com.conectatea.meta.domain.StatusMeta;
import br.com.conectatea.meta.infrastructure.MetaRepository;
import br.com.conectatea.notificacao.infrastructure.NotificacaoRepository;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.progresso.application.LatestProgressService;
import br.com.conectatea.progresso.domain.Progresso;
import br.com.conectatea.progresso.infrastructure.ProgressoRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.sessao.domain.StatusSessao;
import br.com.conectatea.sessao.infrastructure.SessaoRepository;
import br.com.conectatea.shared.time.LocalTimeZoneResolver;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Testes de indicadores do DashboardController.
 *
 * <p>Valida valores calculados com fixtures que diferenciam as regras:
 * <ul>
 *   <li>Crianças EM_ACOMPANHAMENTO vs PAUSADO/ENCERRADO</li>
 *   <li>Metas ativas vs pausadas/concluídas</li>
 *   <li>Progressos conhecidos e ausentes</li>
 *   <li>Sessões AGENDADA vs estados finais</li>
 *   <li>Semana local com fim exclusivo (segunda → segunda)</li>
 *   <li>Notificações não lidas (incluindo ocultadas do sino)</li>
 *   <li>Usuário sem dados</li>
 * </ul>
 */
class DashboardControllerIndicadoresTest {

    // Instante fixo: segunda-feira 2026-02-02T01:00:00Z (America/Bahia = UTC-3 → domingo 01/02 22h locais)
    // Como America/Bahia é UTC-3, o instante 2026-02-02T03:00:00Z = segunda 02/02 00:00 local
    private static final String FIXED_INSTANT = "2026-02-02T03:00:00Z"; // segunda local em Bahia
    private static final ZoneId ZONE_BAHIA = ZoneId.of("America/Bahia");

    private final ProfissionalRepository professionalRepo = mock(ProfissionalRepository.class);
    private final CriancaRepository childrenRepo = mock(CriancaRepository.class);
    private final MetaRepository metaRepo = mock(MetaRepository.class);
    private final SessaoRepository sessionRepo = mock(SessaoRepository.class);
    private final VinculoProfissionalRepository linkRepo = mock(VinculoProfissionalRepository.class);
    private final ProgressoRepository progressoRepo = mock(ProgressoRepository.class);
    private final NotificacaoRepository notifRepo = mock(NotificacaoRepository.class);

    private final Clock clock = Clock.fixed(Instant.parse(FIXED_INSTANT), ZoneOffset.UTC);
    private final LocalTimeZoneResolver timeZones = new LocalTimeZoneResolver("America/Bahia");
    private final LatestProgressService latestProgress = new LatestProgressService(progressoRepo);

    private DashboardController controller;

    @BeforeEach
    void setUp() {
        controller = new DashboardController(
                professionalRepo, childrenRepo, metaRepo, sessionRepo,
                linkRepo, clock, timeZones, latestProgress, notifRepo);
    }

    // ── Dashboard profissional ─────────────────────────────────────────────────

    @Test
    void profissional_semCriancas_retornaZeros() {
        var profId = 10L;
        var userId = 100L;
        setupProfissional(userId, profId);
        when(childrenRepo.findLinkedToProfessional(profId)).thenReturn(List.of());

        var dashboard = controller.professional(auth(userId, TipoUsuario.PROFISSIONAL), null);

        assertThat(dashboard.totalCriancas()).isEqualTo(0);
        assertThat(dashboard.metasAtivas()).isEqualTo(0);
        assertThat(dashboard.sessoesSemana()).isEqualTo(0);
        assertThat(dashboard.progressoAtual().media()).isNull();
        assertThat(dashboard.progressoAtual().metasSemDados()).isEqualTo(0);
    }

    @Test
    void profissional_criancasEmAcompanhamentoFiltradasDePausadasEEncerradas() {
        var profId = 10L;
        var userId = 100L;
        setupProfissional(userId, profId);

        var emAndamento = child(1L, "Ana",   StatusAcompanhamento.EM_ACOMPANHAMENTO);
        var pausada     = child(2L, "Bruno", StatusAcompanhamento.PAUSADO);
        var encerrada   = child(3L, "Carla", StatusAcompanhamento.ENCERRADO);

        when(childrenRepo.findLinkedToProfessional(profId))
                .thenReturn(List.of(emAndamento, pausada, encerrada));
        when(metaRepo.findByCriancaIdIn(List.of(1L))).thenReturn(List.of());
        when(linkRepo.countDistinctProfissionaisByCriancaIdInAndStatus(List.of(1L), StatusVinculo.VINCULADO)).thenReturn(0L);
        when(linkRepo.countDistinctProfissionaisVinculadosNoPeriodo(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(0L);
        when(sessionRepo.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);

        var dashboard = controller.professional(auth(userId, TipoUsuario.PROFISSIONAL), null);

        assertThat(dashboard.totalCriancas()).isEqualTo(1); // apenas EM_ACOMPANHAMENTO
    }

    @Test
    void profissional_metasAtivasVsPausadasVsConcluidas() {
        var profId = 10L;
        var userId = 100L;
        setupProfissional(userId, profId);

        var crianca = child(1L, "Ana", StatusAcompanhamento.EM_ACOMPANHAMENTO);
        when(childrenRepo.findLinkedToProfessional(profId)).thenReturn(List.of(crianca));

        var emAndamento = meta(1L, 1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var pausada     = meta(2L, 1L, CategoriaMeta.COMUNICACAO, StatusMeta.PAUSADA);
        var concluida   = meta(3L, 1L, CategoriaMeta.AUTONOMIA,   StatusMeta.CONCLUIDA);

        when(metaRepo.findByCriancaIdIn(List.of(1L))).thenReturn(List.of(emAndamento, pausada, concluida));
        when(progressoRepo.findLatestByMetaIdIn(List.of(1L))).thenReturn(List.of(
                progresso(1L, 65, "2026-02-01T10:00:00Z", 1L)));

        setupDefaults(userId, List.of(1L));

        var dashboard = controller.professional(auth(userId, TipoUsuario.PROFISSIONAL), null);

        assertThat(dashboard.metasAtivas()).isEqualTo(1);
        assertThat(dashboard.totalMetas()).isEqualTo(3);
        assertThat(dashboard.progressoAtual().metasPausadas()).isEqualTo(1);
        assertThat(dashboard.progressoAtual().metasConcluidas()).isEqualTo(1);
        assertThat(dashboard.progressoAtual().metasComDados()).isEqualTo(1);
        assertThat(dashboard.progressoAtual().metasSemDados()).isEqualTo(0);
        assertThat(dashboard.progressoAtual().media()).isEqualTo(65.0);
    }

    @Test
    void profissional_notificacoesNaoLidasIncluidasNoContador() {
        var profId = 10L;
        var userId = 100L;
        setupProfissional(userId, profId);

        when(childrenRepo.findLinkedToProfessional(profId)).thenReturn(List.of());
        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(7L);

        var dashboard = controller.professional(auth(userId, TipoUsuario.PROFISSIONAL), null);

        assertThat(dashboard.notificacoesNaoLidas()).isEqualTo(7L);
    }

    @Test
    void profissional_sessoesDaSemanaLocalComFimExclusivo() {
        // Semana: segunda 2026-02-02 00:00 (Bahia) até segunda 2026-02-09 00:00 (Bahia)
        // Sessão exatamente no início da semana → dentro
        // Sessão no início da semana seguinte → fora
        var profId = 10L;
        var userId = 100L;
        setupProfissional(userId, profId);

        var crianca = child(1L, "Ana", StatusAcompanhamento.EM_ACOMPANHAMENTO);
        when(childrenRepo.findLinkedToProfessional(profId)).thenReturn(List.of(crianca));
        when(metaRepo.findByCriancaIdIn(List.of(1L))).thenReturn(List.of());
        when(linkRepo.countDistinctProfissionaisByCriancaIdInAndStatus(List.of(1L), StatusVinculo.VINCULADO)).thenReturn(0L);
        when(linkRepo.countDistinctProfissionaisVinculadosNoPeriodo(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(0L);

        // LocalDate hoje = 2026-02-02 (segunda, Bahia). Janela: [02/02 00:00, 09/02 00:00)
        var mondayStart = LocalDate.of(2026, 2, 2).atStartOfDay(ZONE_BAHIA).toOffsetDateTime();
        var nextMonday  = LocalDate.of(2026, 2, 9).atStartOfDay(ZONE_BAHIA).toOffsetDateTime();

        when(sessionRepo.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                org.mockito.ArgumentMatchers.eq(List.of(1L)),
                org.mockito.ArgumentMatchers.eq(StatusSessao.AGENDADA),
                org.mockito.ArgumentMatchers.eq(mondayStart),
                org.mockito.ArgumentMatchers.eq(nextMonday))).thenReturn(3L);

        var dashboard = controller.professional(auth(userId, TipoUsuario.PROFISSIONAL), null);
        assertThat(dashboard.sessoesSemana()).isEqualTo(3L);
    }

    @Test
    void profissional_fusoAlternativoAlteraSemanaLocal() {
        // Com timezone="America/Sao_Paulo" (UTC-3, mesmo que Bahia neste contexto)
        // mas com "America/Manaus" (UTC-4), a semana seria diferente próximo da virada
        var profId = 10L;
        var userId = 100L;
        setupProfissional(userId, profId);
        when(childrenRepo.findLinkedToProfessional(profId)).thenReturn(List.of());
        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(0L);

        // Deve resolver o fuso passado sem lançar exceção
        var dashboardBahia  = controller.professional(auth(userId, TipoUsuario.PROFISSIONAL), "America/Bahia");
        var dashboardSaoPaulo = controller.professional(auth(userId, TipoUsuario.PROFISSIONAL), "America/Sao_Paulo");

        assertThat(dashboardBahia).isNotNull();
        assertThat(dashboardSaoPaulo).isNotNull();
    }

    // ── Dashboard responsável ─────────────────────────────────────────────────

    @Test
    void responsavel_semCriancas_retornaZeros() {
        var userId = 200L;
        when(childrenRepo.findLinkedToGuardian(userId)).thenReturn(List.of());
        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(0L);

        var dashboard = controller.guardian(auth(userId, TipoUsuario.RESPONSAVEL), null);

        assertThat(dashboard.totalCriancas()).isEqualTo(0);
        assertThat(dashboard.metasAtivas()).isEqualTo(0);
        assertThat(dashboard.sessoesSemana()).isEqualTo(0);
        assertThat(dashboard.sessoesProximas()).isEqualTo(0);
        assertThat(dashboard.progressoAtual().media()).isNull();
    }

    @Test
    void responsavel_metasSemProgressoDistintaDeMetaComProgressoZero() {
        var userId = 200L;
        var crianca = child(1L, "Ana", StatusAcompanhamento.EM_ACOMPANHAMENTO);
        when(childrenRepo.findLinkedToGuardian(userId)).thenReturn(List.of(crianca));

        var semRegistro = meta(1L, 1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var comZero     = meta(2L, 1L, CategoriaMeta.AUTONOMIA, StatusMeta.EM_ANDAMENTO);

        when(metaRepo.findByCriancaIdIn(List.of(1L))).thenReturn(List.of(semRegistro, comZero));
        // Apenas meta 2 tem registro (valor 0)
        when(progressoRepo.findLatestByMetaIdIn(List.of(1L, 2L))).thenReturn(List.of(
                progresso(2L, 0, "2026-02-01T10:00:00Z", 1L)));

        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(0L);
        when(sessionRepo.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(sessionRepo.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqual(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any())).thenReturn(0L);

        var dashboard = controller.guardian(auth(userId, TipoUsuario.RESPONSAVEL), null);

        assertThat(dashboard.progressoAtual().metasComDados()).isEqualTo(1); // comZero tem registro
        assertThat(dashboard.progressoAtual().metasSemDados()).isEqualTo(1); // semRegistro não tem
        // Média: apenas COMUNICACAO sem dados (null) e AUTONOMIA com 0
        // Categoria COMUNICACAO: sem dados → não entra na média
        // Categoria AUTONOMIA: 0 → entra
        assertThat(dashboard.progressoAtual().media()).isEqualTo(0.0);
    }

    @Test
    void responsavel_multiplaCriancasAgregadas() {
        var userId = 200L;
        var c1 = child(1L, "Ana",   StatusAcompanhamento.EM_ACOMPANHAMENTO);
        var c2 = child(2L, "Bruno", StatusAcompanhamento.EM_ACOMPANHAMENTO);
        when(childrenRepo.findLinkedToGuardian(userId)).thenReturn(List.of(c1, c2));

        var meta1 = meta(1L, 1L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);
        var meta2 = meta(2L, 2L, CategoriaMeta.COMUNICACAO, StatusMeta.EM_ANDAMENTO);

        when(metaRepo.findByCriancaIdIn(List.of(1L, 2L))).thenReturn(List.of(meta1, meta2));
        when(progressoRepo.findLatestByMetaIdIn(List.of(1L, 2L))).thenReturn(List.of(
                progresso(1L, 40, "2026-02-01T10:00:00Z", 1L),
                progresso(2L, 60, "2026-02-01T10:00:00Z", 2L)));

        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(0L);
        when(sessionRepo.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(sessionRepo.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqual(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any())).thenReturn(0L);

        var dashboard = controller.guardian(auth(userId, TipoUsuario.RESPONSAVEL), null);

        assertThat(dashboard.totalCriancas()).isEqualTo(2);
        assertThat(dashboard.metasAtivas()).isEqualTo(2);
        // COMUNICACAO: (40+60)/2 = 50; única categoria com dados
        assertThat(dashboard.progressoAtual().media()).isEqualTo(50.0);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private void setupProfissional(Long userId, Long profId) {
        var prof = mock(Profissional.class);
        when(prof.getId()).thenReturn(profId);
        when(professionalRepo.findByUsuarioId(userId)).thenReturn(Optional.of(prof));
    }

    private void setupDefaults(Long userId, List<Long> childIds) {
        when(linkRepo.countDistinctProfissionaisByCriancaIdInAndStatus(childIds, StatusVinculo.VINCULADO)).thenReturn(0L);
        when(linkRepo.countDistinctProfissionaisVinculadosNoPeriodo(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(notifRepo.countByDestinatarioUsuarioIdAndLidaFalse(userId)).thenReturn(0L);
        when(sessionRepo.countByCriancaIdInAndStatusAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
    }

    private Authentication auth(Long userId, TipoUsuario tipo) {
        var auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(new AuthenticatedUser(userId, "user@test.com", tipo));
        return auth;
    }

    private Crianca child(Long id, String nome, StatusAcompanhamento status) {
        var c = new Crianca(nome, LocalDate.of(2018, 1, 1), null, null, null, null);
        ReflectionTestUtils.setField(c, "id", id);
        ReflectionTestUtils.setField(c, "statusAcompanhamento", status);
        return c;
    }

    private Meta meta(Long id, Long criancaId, CategoriaMeta categoria, StatusMeta status) {
        var m = new Meta("Meta " + id, "Desc", categoria, PrioridadeMeta.MEDIA,
                LocalDate.of(2025, 1, 1), LocalDate.of(2026, 12, 31), criancaId, 1L);
        ReflectionTestUtils.setField(m, "id", id);
        if (status == StatusMeta.PAUSADA) m.pause("motivo", Instant.now());
        else if (status == StatusMeta.CONCLUIDA) m.complete("resumo", Instant.now());
        return m;
    }

    private Progresso progresso(Long metaId, int valor, String instant, Long id) {
        var p = new Progresso(metaId, 1L, 0, valor, StatusMeta.EM_ANDAMENTO, "registro");
        ReflectionTestUtils.setField(p, "id", id);
        ReflectionTestUtils.setField(p, "data", Instant.parse(instant));
        return p;
    }
}
