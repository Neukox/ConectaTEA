package br.com.conectatea.anotacao.application;

import static br.com.conectatea.anotacao.domain.VisibilidadeAnotacao.COMPARTILHADA;
import static br.com.conectatea.anotacao.domain.VisibilidadeAnotacao.PRIVADA;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.conectatea.anotacao.domain.Anotacao;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import br.com.conectatea.anotacao.infrastructure.AnotacaoRepository;
import br.com.conectatea.auditoria.application.AuditLogService;
import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.notificacao.application.NotificationService;
import br.com.conectatea.notificacao.domain.TipoNotificacao;
import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.security.AuthorizationService;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AnotacaoServiceTest {
    @Mock AnotacaoRepository anotacoes;
    @Mock CriancaRepository criancas;
    @Mock ProfissionalRepository profissionais;
    @Mock UsuarioRepository usuarios;
    @Mock AuthorizationService autorizacaoCrianca;
    @Mock AuditLogService auditoria;
    @Mock NotificationService notificacoes;

    private final AnotacaoAuthorizationService autorizacaoAnotacao =
            new AnotacaoAuthorizationService();
    private AnotacaoService service;
    private Crianca crianca;
    private Profissional autor;
    private Profissional outro;
    private Usuario autorUsuario;

    @BeforeEach
    void setup() {
        service = new AnotacaoService(
                anotacoes, criancas, profissionais, usuarios,
                autorizacaoCrianca, autorizacaoAnotacao, auditoria, notificacoes);
        crianca = child(10L);
        autor = professional(20L, 1L);
        outro = professional(21L, 2L);
        autorUsuario = user(1L, "Dra. Autora", TipoUsuario.PROFISSIONAL);
    }

    @ParameterizedTest
    @EnumSource(VisibilidadeAnotacao.class)
    void profissionalCriaPrivadaOuCompartilhada(VisibilidadeAnotacao visibilidade) {
        when(profissionais.findByUsuarioId(1L)).thenReturn(Optional.of(autor));
        when(criancas.findById(10L)).thenReturn(Optional.of(crianca));
        when(usuarios.findById(1L)).thenReturn(Optional.of(autorUsuario));
        when(anotacoes.save(any())).thenAnswer(invocation -> {
            var item = invocation.getArgument(0, Anotacao.class);
            ReflectionTestUtils.setField(item, "id", 30L);
            return item;
        });

        var response = service.criar(professionalUser(1L), 10L, "Conteúdo válido da anotação", visibilidade);

        assertThat(response.visibilidade()).isEqualTo(visibilidade);
        assertThat(response.isAutor()).isTrue();
        verify(auditoria).record(1L, "ANNOTATION_CREATED", "ANOTACAO", 30L,
                10L, 20L, "SUCESSO", "visibilidade=" + visibilidade);
        if (visibilidade == COMPARTILHADA) {
            verify(notificacoes).registrarAlteracaoAnotacao(TipoNotificacao.ANOTACAO_CRIADA,
                    10L, "Lia", 30L, 1L, "Dra. Autora");
        } else {
            verifyNoNotification();
        }
    }

    @Test
    void responsavelNaoCria() {
        assertThatThrownBy(() -> service.criar(
                guardianUser(3L), 10L, "Conteúdo válido da anotação", COMPARTILHADA))
                .isInstanceOf(AccessDeniedException.class);
        verify(anotacoes, never()).save(any());
    }

    @ParameterizedTest
    @EnumSource(VisibilidadeAnotacao.class)
    void autorEditaETrocaVisibilidade(VisibilidadeAnotacao visibilidade) {
        var anotacao = annotation(30L, autor, PRIVADA);
        ownedSetup(anotacao);

        var response = service.atualizar(
                professionalUser(1L), 10L, 30L, "Conteúdo alterado com sucesso", visibilidade);

        assertThat(response.visibilidade()).isEqualTo(visibilidade);
        assertThat(anotacao.getConteudo()).isEqualTo("Conteúdo alterado com sucesso");
        if (visibilidade == COMPARTILHADA) {
            verify(notificacoes).registrarAlteracaoAnotacao(
                    TipoNotificacao.ANOTACAO_COMPARTILHADA, 10L, "Lia", 30L,
                    1L, "Dra. Autora");
        } else {
            verifyNoNotification();
        }
    }

    @Test
    void editarCompartilhadaGeraNotificacaoDeEdicao() {
        ownedSetup(annotation(30L, autor, COMPARTILHADA));
        service.atualizar(professionalUser(1L), 10L, 30L,
                "Conteúdo compartilhado atualizado", COMPARTILHADA);
        verify(notificacoes).registrarAlteracaoAnotacao(TipoNotificacao.ANOTACAO_EDITADA,
                10L, "Lia", 30L, 1L, "Dra. Autora");
    }

    @Test
    void tornarCompartilhadaPrivadaInformaAntigosDestinatarios() {
        ownedSetup(annotation(30L, autor, COMPARTILHADA));
        service.atualizar(professionalUser(1L), 10L, 30L,
                "Conteúdo agora privado e protegido", PRIVADA);
        verify(notificacoes).registrarAlteracaoAnotacao(
                TipoNotificacao.ANOTACAO_TORNADA_PRIVADA, 10L, "Lia", 30L,
                1L, "Dra. Autora");
    }

    @Test
    void outroProfissionalNaoEdita() {
        when(profissionais.findByUsuarioId(2L)).thenReturn(Optional.of(outro));
        when(anotacoes.findByIdAndCriancaId(30L, 10L))
                .thenReturn(Optional.of(annotation(30L, autor, COMPARTILHADA)));

        assertThatThrownBy(() -> service.atualizar(
                professionalUser(2L), 10L, 30L, "Conteúdo alterado com sucesso", PRIVADA))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void outroProfissionalNaoExclui() {
        when(profissionais.findByUsuarioId(2L)).thenReturn(Optional.of(outro));
        when(anotacoes.findByIdAndCriancaId(30L, 10L))
                .thenReturn(Optional.of(annotation(30L, autor, COMPARTILHADA)));

        assertThatThrownBy(() -> service.excluir(professionalUser(2L), 10L, 30L))
                .isInstanceOf(AccessDeniedException.class);
        verify(anotacoes, never()).delete(any());
    }

    @Test
    void autorExclui() {
        var anotacao = annotation(30L, autor, PRIVADA);
        when(profissionais.findByUsuarioId(1L)).thenReturn(Optional.of(autor));
        when(anotacoes.findByIdAndCriancaId(30L, 10L)).thenReturn(Optional.of(anotacao));

        service.excluir(professionalUser(1L), 10L, 30L);

        verify(anotacoes).delete(anotacao);
        verify(auditoria).record(1L, "ANNOTATION_DELETED", "ANOTACAO", 30L,
                10L, 20L, "SUCESSO", "visibilidade=PRIVADA");
        verifyNoNotification();
    }

    @Test
    void excluirCompartilhadaGeraNotificacao() {
        var anotacao = annotation(30L, autor, COMPARTILHADA);
        when(profissionais.findByUsuarioId(1L)).thenReturn(Optional.of(autor));
        when(anotacoes.findByIdAndCriancaId(30L, 10L)).thenReturn(Optional.of(anotacao));
        when(usuarios.findById(1L)).thenReturn(Optional.of(autorUsuario));

        service.excluir(professionalUser(1L), 10L, 30L);

        verify(notificacoes).registrarAlteracaoAnotacao(TipoNotificacao.ANOTACAO_EXCLUIDA,
                10L, "Lia", 30L, 1L, "Dra. Autora");
    }

    @Test
    void profissionalVePropriaPrivada() {
        var anotacao = annotation(30L, autor, PRIVADA);
        when(profissionais.findByUsuarioId(1L)).thenReturn(Optional.of(autor));
        when(anotacoes.findByIdAndCriancaId(30L, 10L)).thenReturn(Optional.of(anotacao));
        when(usuarios.findById(1L)).thenReturn(Optional.of(autorUsuario));

        assertThat(service.buscar(professionalUser(1L), 10L, 30L).isAutor()).isTrue();
    }

    @Test
    void profissionalNaoVePrivadaDeOutro() {
        when(profissionais.findByUsuarioId(2L)).thenReturn(Optional.of(outro));
        when(anotacoes.findByIdAndCriancaId(30L, 10L))
                .thenReturn(Optional.of(annotation(30L, autor, PRIVADA)));

        assertThatThrownBy(() -> service.buscar(professionalUser(2L), 10L, 30L))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void profissionalVeCompartilhadaDeOutroQuandoVinculado() {
        when(profissionais.findByUsuarioId(2L)).thenReturn(Optional.of(outro));
        when(anotacoes.findByIdAndCriancaId(30L, 10L))
                .thenReturn(Optional.of(annotation(30L, autor, COMPARTILHADA)));
        when(usuarios.findById(1L)).thenReturn(Optional.of(autorUsuario));

        var response = service.buscar(professionalUser(2L), 10L, 30L);
        assertThat(response.isAutor()).isFalse();
    }

    @Test
    void responsavelVeCompartilhadaComIsAutorSempreFalse() {
        when(anotacoes.findByIdAndCriancaId(30L, 10L))
                .thenReturn(Optional.of(annotation(30L, autor, COMPARTILHADA)));
        when(usuarios.findById(1L)).thenReturn(Optional.of(autorUsuario));

        assertThat(service.buscar(guardianUser(3L), 10L, 30L).isAutor()).isFalse();
    }

    @Test
    void responsavelNaoVePrivada() {
        when(anotacoes.findByIdAndCriancaId(30L, 10L))
                .thenReturn(Optional.of(annotation(30L, autor, PRIVADA)));

        assertThatThrownBy(() -> service.buscar(guardianUser(3L), 10L, 30L))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void usuarioSemVinculoNaoLista() {
        org.mockito.Mockito.doThrow(new AccessDeniedException("sem vínculo"))
                .when(autorizacaoCrianca).requireCrianca(any(), eq(10L));

        assertThatThrownBy(() -> service.listar(
                guardianUser(3L), 10L, null, null, "", "RECENTES"))
                .isInstanceOf(AccessDeniedException.class);
        verify(anotacoes, never()).findVisiveis(any(), any(), any(), any(), any(), any());
    }

    @Test
    void idorPorCriancaNaoEncontraAnotacao() {
        when(anotacoes.findByIdAndCriancaId(30L, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscar(professionalUser(1L), 99L, 30L))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void filtroPrivadoDoResponsavelEhRejeitadoSemConsultarRepositorio() {
        assertThatThrownBy(() -> service.listar(
                guardianUser(3L), 10L, PRIVADA, null, "", "RECENTES"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(anotacoes, never()).findVisiveis(any(), any(), any(), any(), any(), any());
    }

    @Test
    void listagemDoResponsavelForcaCompartilhadasEFiltrosSeguros() {
        when(anotacoes.findVisiveis(eq(10L), eq(null), eq(COMPARTILHADA), eq(20L),
                eq("comunicação"), any(Sort.class))).thenReturn(List.of());

        service.listar(guardianUser(3L), 10L, null, 20L, " comunicação ", "ANTIGAS");

        verify(anotacoes).findVisiveis(eq(10L), eq(null), eq(COMPARTILHADA), eq(20L),
                eq("comunicação"), eq(Sort.by(Sort.Direction.ASC, "createdAt")));
    }

    private void ownedSetup(Anotacao anotacao) {
        when(profissionais.findByUsuarioId(1L)).thenReturn(Optional.of(autor));
        when(anotacoes.findByIdAndCriancaId(30L, 10L)).thenReturn(Optional.of(anotacao));
        when(usuarios.findById(1L)).thenReturn(Optional.of(autorUsuario));
    }

    private Anotacao annotation(Long id, Profissional professional, VisibilidadeAnotacao visibility) {
        var result = new Anotacao(crianca, professional, "Conteúdo inicial válido", visibility);
        ReflectionTestUtils.setField(result, "id", id);
        return result;
    }

    private Crianca child(Long id) {
        var result = new Crianca("Lia", LocalDate.of(2018, 1, 1), null, null, null, null);
        ReflectionTestUtils.setField(result, "id", id);
        return result;
    }

    private Profissional professional(Long id, Long userId) {
        var result = new Profissional(userId, "PROF" + id);
        ReflectionTestUtils.setField(result, "id", id);
        return result;
    }

    private Usuario user(Long id, String name, TipoUsuario role) {
        var result = new Usuario(name, name.replace(" ", "") + "@test.local", "hash", null, null, role);
        ReflectionTestUtils.setField(result, "id", id);
        return result;
    }

    private AuthenticatedUser professionalUser(Long id) {
        return new AuthenticatedUser(id, "prof@test.local", TipoUsuario.PROFISSIONAL);
    }

    private AuthenticatedUser guardianUser(Long id) {
        return new AuthenticatedUser(id, "resp@test.local", TipoUsuario.RESPONSAVEL);
    }

    private void verifyNoNotification() {
        verify(notificacoes, never()).registrarAlteracaoAnotacao(
                any(), any(), any(), any(), any(), any());
    }
}
