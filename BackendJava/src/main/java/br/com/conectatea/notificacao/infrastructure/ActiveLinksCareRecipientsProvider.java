package br.com.conectatea.notificacao.infrastructure;

import br.com.conectatea.notificacao.application.CareRecipientsProvider;
import br.com.conectatea.notificacao.application.NotificationRecipient;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import br.com.conectatea.vinculo.domain.StatusVinculo;
import br.com.conectatea.vinculo.infrastructure.VinculoProfissionalRepository;
import br.com.conectatea.vinculo.infrastructure.VinculoResponsavelRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ActiveLinksCareRecipientsProvider implements CareRecipientsProvider {
    private final VinculoProfissionalRepository vinculosProfissionais;
    private final VinculoResponsavelRepository vinculosResponsaveis;
    private final ProfissionalRepository profissionais;
    private final UsuarioRepository usuarios;

    public ActiveLinksCareRecipientsProvider(VinculoProfissionalRepository vinculosProfissionais,
            VinculoResponsavelRepository vinculosResponsaveis,
            ProfissionalRepository profissionais, UsuarioRepository usuarios) {
        this.vinculosProfissionais = vinculosProfissionais;
        this.vinculosResponsaveis = vinculosResponsaveis;
        this.profissionais = profissionais;
        this.usuarios = usuarios;
    }

    @Override
    public List<NotificationRecipient> findActiveRecipients(Long criancaId, Long actorUsuarioId) {
        var profissionalIds = vinculosProfissionais
                .findAllByCriancaIdAndStatus(criancaId, StatusVinculo.VINCULADO)
                .stream().map(link -> link.getProfissionalId()).distinct().toList();
        var usuarioIds = new LinkedHashSet<Long>();
        profissionais.findAllById(profissionalIds).stream()
                .map(profissional -> profissional.getUsuarioId()).forEach(usuarioIds::add);
        vinculosResponsaveis.findAllByCriancaIdAndStatus(criancaId, StatusVinculo.VINCULADO)
                .stream().map(link -> link.getResponsavelId()).forEach(usuarioIds::add);
        usuarioIds.remove(actorUsuarioId);

        var encontrados = usuarios.findAllById(usuarioIds).stream()
                .filter(Usuario::isAtivo)
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));
        return usuarioIds.stream().map(encontrados::get).filter(java.util.Objects::nonNull)
                .map(user -> new NotificationRecipient(
                        user.getId(), user.getNome(), user.getEmail(), user.getTipo()))
                .toList();
    }
}
