package br.com.conectatea.vinculo.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.conectatea.crianca.domain.Crianca;
import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.domain.Consentimento;
import br.com.conectatea.vinculo.domain.StatusToken;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.domain.TokenVinculo;
import br.com.conectatea.vinculo.domain.VinculoResponsavelCrianca;
import br.com.conectatea.vinculo.infrastructure.ConsentimentoRepository;
import br.com.conectatea.vinculo.infrastructure.TokenVinculoRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class VinculoServiceTest {
    private final TokenVinculoRepository tokens = org.mockito.Mockito.mock(TokenVinculoRepository.class);
    private final CriancaRepository children = org.mockito.Mockito.mock(CriancaRepository.class);
    private final VinculoResponsavelRepository links =
            org.mockito.Mockito.mock(VinculoResponsavelRepository.class);
    private final ConsentimentoRepository consents =
            org.mockito.Mockito.mock(ConsentimentoRepository.class);
    private final VinculoService service = new VinculoService(
            tokens, children, links, consents, "2026-10", "Acompanhamento terapêutico");

    @Test
    void reactivatesExistingUnlinkedRelationshipBeforeConsumingToken() {
        var token = pendingToken();
        var link = new VinculoResponsavelCrianca(5L, 9L);
        link.desvincular();
        when(tokens.findByHashForUpdate(anyString())).thenReturn(Optional.of(token));
        when(links.findByResponsavelIdAndCriancaId(5L, 9L)).thenReturn(Optional.of(link));
        when(children.findById(9L)).thenReturn(Optional.of(child()));

        service.confirm("code", true, guardian(), "127.0.0.1", "test");

        assertThat(link.getStatus()).isEqualTo(StatusVinculo.VINCULADO);
        assertThat(token.getStatus()).isEqualTo(StatusToken.USADO);
        verify(links, never()).save(any(VinculoResponsavelCrianca.class));
        verify(consents).save(any(Consentimento.class));
    }

    @Test
    void replayReturnsGoneWithoutChangingRelationships() {
        var token = pendingToken();
        token.consumir(Instant.now());
        when(tokens.findByHashForUpdate(anyString())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.confirm(
                "code", true, guardian(), "127.0.0.1", "test"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error)
                        .getStatusCode().value()).isEqualTo(410));
        verify(links, never()).save(any());
    }

    @Test
    void generateReturnsActualPngQrCodeDataUrl() {
        when(tokens.save(any(TokenVinculo.class))).thenAnswer(invocation -> {
            var token = invocation.getArgument(0, TokenVinculo.class);
            ReflectionTestUtils.setField(token, "id", 77L);
            return token;
        });

        var generated = service.generate(9L, 12L);

        assertThat(generated.id()).isEqualTo(77L);
        assertThat(generated.qrCodeDataUrl()).startsWith("data:image/png;base64,iVBOR");
    }

    private TokenVinculo pendingToken() {
        return new TokenVinculo("hash", 9L, 12L, Instant.now().plusSeconds(3600));
    }

    private Crianca child() {
        var child = new Crianca("Lia", LocalDate.of(2018, 4, 12), null, null, null, null);
        ReflectionTestUtils.setField(child, "id", 9L);
        return child;
    }

    private AuthenticatedUser guardian() {
        return new AuthenticatedUser(5L, "familia@example.com", TipoUsuario.RESPONSAVEL);
    }
}
