package br.com.conectatea.profissional.application;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.shared.domain.BusinessRuleException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileImageService {
    public static final long MAX_BYTES = 5L * 1024 * 1024;
    private final ProfileImageStorage storage;

    public ProfileImageService(ProfileImageStorage storage) { this.storage = storage; }

    @Transactional
    public String replace(Profissional professional, MultipartFile file) {
        var image = validate(file);
        var extension = image.format().equals("image/png") ? ".png" : ".jpg";
        var key = UUID.randomUUID() + extension;
        var previous = professional.getFotoPerfilUrl();
        try {
            storage.store(key, image.bytes());
            professional.setFotoPerfilUrl("/profissionais/fotos/" + key);
            deletePrevious(previous);
            return professional.getFotoPerfilUrl();
        } catch (IOException exception) {
            try { storage.delete(key); } catch (IOException ignored) { }
            throw new BusinessRuleException("PROFILE_IMAGE_STORAGE_FAILED", "Não foi possível armazenar a foto");
        }
    }

    @Transactional
    public void remove(Profissional professional) {
        var previous = professional.getFotoPerfilUrl();
        professional.setFotoPerfilUrl(null);
        deletePrevious(previous);
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
            BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(bytes));
            if (decoded == null) throw invalid();
            if (decoded.getWidth() < 64 || decoded.getHeight() < 64 || decoded.getWidth() > 4096 || decoded.getHeight() > 4096) {
                throw new BusinessRuleException("PROFILE_IMAGE_DIMENSIONS", "A foto deve ter entre 64 e 4096 pixels por dimensão");
            }
            return new ValidatedImage(bytes, format);
        } catch (IOException exception) {
            throw invalid();
        }
    }

    private String signature(byte[] bytes) {
        if (bytes.length >= 8 && (bytes[0] & 0xff) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4e && bytes[3] == 0x47) return "image/png";
        if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff) return "image/jpeg";
        throw invalid();
    }

    private void deletePrevious(String url) {
        if (url == null || !url.startsWith("/profissionais/fotos/")) return;
        try { storage.delete(url.substring(url.lastIndexOf('/') + 1)); }
        catch (IOException exception) { throw new BusinessRuleException("PROFILE_IMAGE_CLEANUP_FAILED", "Não foi possível remover a foto anterior"); }
    }

    private BusinessRuleException invalid() {
        return new BusinessRuleException("PROFILE_IMAGE_INVALID", "A foto deve ser JPEG ou PNG válido");
    }

    private record ValidatedImage(byte[] bytes, String format) {}
    public record ImageContent(byte[] bytes, String contentType) {}
}
