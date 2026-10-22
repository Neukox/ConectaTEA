package br.com.conectatea.profissional.infrastructure;

import br.com.conectatea.profissional.application.ProfileImageStorage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class LocalProfileImageStorage implements ProfileImageStorage {
    private final Path root;

    public LocalProfileImageStorage(@Value("${app.profile-images.directory:${java.io.tmpdir}/conectatea-profile-images}") String directory) {
        this.root = Path.of(directory).toAbsolutePath().normalize();
    }

    @Override
    public void store(String key, byte[] content) throws IOException {
        Files.createDirectories(root);
        Files.write(resolve(key), content);
    }

    @Override
    public byte[] load(String key) throws IOException {
        return Files.readAllBytes(resolve(key));
    }

    @Override
    public void delete(String key) throws IOException {
        Files.deleteIfExists(resolve(key));
    }

    private Path resolve(String key) {
        var resolved = root.resolve(key).normalize();
        if (!resolved.getParent().equals(root)) throw new IllegalArgumentException("Invalid image key");
        return resolved;
    }
}
