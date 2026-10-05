package br.com.conectatea.anotacao.application;

import br.com.conectatea.anotacao.domain.Anotacao;
import br.com.conectatea.anotacao.domain.VisibilidadeAnotacao;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import java.util.NoSuchElementException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class AnotacaoAuthorizationService {
    public boolean podeVisualizar(
            AuthenticatedUser usuario,
            Long profissionalAtualId,
            Anotacao anotacao) {
        if (anotacao.getVisibilidade() == VisibilidadeAnotacao.COMPARTILHADA) {
            return true;
        }
        return usuario.tipo() == TipoUsuario.PROFISSIONAL
                && profissionalAtualId != null
                && profissionalAtualId.equals(anotacao.getAutor().getId());
    }

    public void exigirVisualizacao(
            AuthenticatedUser usuario,
            Long profissionalAtualId,
            Anotacao anotacao) {
        if (!podeVisualizar(usuario, profissionalAtualId, anotacao)) {
            // Privadas alheias são indistinguíveis de recursos inexistentes.
            throw new NoSuchElementException("Anotação não encontrada");
        }
    }

    public void exigirAutoria(Long profissionalAtualId, Anotacao anotacao) {
        if (profissionalAtualId == null
                || !profissionalAtualId.equals(anotacao.getAutor().getId())) {
            throw new AccessDeniedException("Somente o profissional autor pode alterar a anotação");
        }
    }
}
