package br.com.conectatea.security;

import br.com.conectatea.crianca.infrastructure.CriancaRepository;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {
    private final CriancaRepository children;
    private final ProfissionalRepository professionals;
    private final VinculoProfissionalRepository professionalLinks;
    private final VinculoResponsavelRepository guardianLinks;

    public AuthorizationService(
            CriancaRepository children,
            ProfissionalRepository professionals,
            VinculoProfissionalRepository professionalLinks,
            VinculoResponsavelRepository guardianLinks) {
        this.children = children;
        this.professionals = professionals;
        this.professionalLinks = professionalLinks;
        this.guardianLinks = guardianLinks;
    }

    public boolean canAccessCrianca(AuthenticatedUser user, Long childId) {
        if (!children.existsByIdAndArquivadaFalse(childId)) {
            return false;
        }
        if (user.tipo() == TipoUsuario.PROFISSIONAL) {
            return professionals.findByUsuarioId(user.id())
                    .map(professional -> professionalLinks
                            .existsByProfissionalIdAndCriancaIdAndStatus(
                                    professional.getId(), childId, StatusVinculo.VINCULADO))
                    .orElse(false);
        }
        return guardianLinks.existsByResponsavelIdAndCriancaIdAndStatus(
                user.id(), childId, StatusVinculo.VINCULADO);
    }

    public void requireCrianca(AuthenticatedUser user, Long childId) {
        if (!canAccessCrianca(user, childId)) {
            throw new AccessDeniedException("Sem vínculo ativo com a criança");
        }
    }
}
