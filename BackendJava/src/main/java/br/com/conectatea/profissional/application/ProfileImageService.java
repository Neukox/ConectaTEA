package br.com.conectatea.profissional.application;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.shared.domain.BusinessRuleException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProfileImageService {
    private static final Logger log = LoggerFactory.getLogger(ProfileImageService.class);
    public static final String REFERENCE_PREFIX = "profile-image:";
    public static final long MAX_BYTES = 5L * 1024 * 1024;
    private final ProfileImageStorage storage;
    private final ProfissionalRepository professionals;

    public ProfileImageService(ProfileImageStorage storage, ProfissionalRepository professionals) {
        this.storage = storage;
        this.professionals = professionals;
    }

    @Transactional
    public Profissional replace(Long authenticatedUserId, MultipartFile file) {
        var image = validate(file);
        var extension = image.format().equals("image/png") ? ".png" : ".jpg";
        var key = UUID.randomUUID() + extension;
        var professional = professionals.findByUsuarioIdForUpdate(authenticatedUserId)
                .orElseThrow(() -> new BusinessRuleException("PROFILE_NOT_FOUND", "Perfil profissional não encontrado"));
        var previous = professional.getFotoPerfilUrl();
        try {
            storage.store(key, image.bytes());
            // Registra a compensação antes do flush: uma falha de banco também
            // precisa remover o arquivo recém-gravado ao concluir o rollback.
            synchronizeFiles(key, previous);
            professional.setFotoPerfilUrl(REFERENCE_PREFIX + key);
            professionals.saveAndFlush(professional);
            return professional;
        } catch (IOException exception) {
            cleanup(key, "nova imagem após falha de gravação");
            throw new BusinessRuleException("PROFILE_IMAGE_STORAGE_FAILED", "Não foi possível armazenar a foto");
        }
    }

    @Transactional
    public Profissional remove(Long authenticatedUserId) {
        var professional = professionals.findByUsuarioIdForUpdate(authenticatedUserId)
                .orElseThrow(() -> new BusinessRuleException("PROFILE_NOT_FOUND", "Perfil profissional não encontrado"));
        var previous = professional.getFotoPerfilUrl();
        professional.setFotoPerfilUrl(null);
        professionals.saveAndFlush(professional);
        afterCommit(() -> cleanup(referenceKey(previous), "imagem removida do perfil"));
        return professional;
    }

    public ImageContent load(String key) {
        if (!key.matches("[0-9a-fA-F-]{36}\\.(png|jpg)")) throw new BusinessRuleException("PROFILE_IMAGE_NOT_FOUND", "Foto não encontrada");
        try {
            var bytes = storage.load(key);
            return new ImageContent(bytes, key.endsWith(".png") ? "image/png" : "image/jpeg");
        } catch (IOException exception) {
            throw new BusinessRuleException("PROFILE_IMAGE_NOT_FOUND", "Foto não encontrada");
        }
    }

    private ValidatedImage validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BusinessRuleException("PROFILE_IMAGE_EMPTY", "Envie uma foto");
        if (file.getSize() > MAX_BYTES) throw new BusinessRuleException("PROFILE_IMAGE_TOO_LARGE", "A foto deve ter no máximo 5 MiB");
        try {
            var bytes = file.getBytes();
            var format = signature(bytes);
            validateDimensionsFromMetadata(bytes);
            BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(bytes));
            if (decoded == null) throw invalid();
            return new ValidatedImage(bytes, format);
        } catch (IOException exception) {
            throw invalid();
        }
    }

    private void validateDimensionsFromMetadata(byte[] bytes) throws IOException {
        try (var input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw invalid();
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                var width = reader.getWidth(0);
                var height = reader.getHeight(0);
                if (width < 64 || height < 64 || width > 4096 || height > 4096) {
                    throw new BusinessRuleException("PROFILE_IMAGE_DIMENSIONS", "A foto deve ter entre 64 e 4096 pixels por dimensão");
                }
            } finally { reader.dispose(); }
        }
    }

    private String signature(byte[] bytes) {
        if (bytes.length >= 8 && (bytes[0] & 0xff) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4e && bytes[3] == 0x47) return "image/png";
        if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff) return "image/jpeg";
        throw invalid();
    }

    private void synchronizeFiles(String newKey, String previousReference) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) cleanup(referenceKey(previousReference), "imagem substituída");
                else cleanup(newKey, "nova imagem após rollback");
            }
        });
    }

    private void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() { action.run(); }
        });
    }

    private String referenceKey(String reference) {
        return reference != null && reference.startsWith(REFERENCE_PREFIX)
                ? reference.substring(REFERENCE_PREFIX.length()) : null;
    }

    private void cleanup(String key, String reason) {
        if (key == null) return;
        try { storage.delete(key); }
        catch (IOException exception) { log.warn("Falha recuperável ao limpar {} ({})", reason, key, exception); }
    }

    private BusinessRuleException invalid() {
        return new BusinessRuleException("PROFILE_IMAGE_INVALID", "A foto deve ser JPEG ou PNG válido");
    }

    private record ValidatedImage(byte[] bytes, String format) {}
    public record ImageContent(byte[] bytes, String contentType) {}
}
