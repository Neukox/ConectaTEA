package br.com.conectatea.profissional.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.shared.domain.BusinessRuleException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

class ProfileImageServiceTest {
    private final ProfileImageStorage storage = mock(ProfileImageStorage.class);
    private final ProfissionalRepository professionals = mock(ProfissionalRepository.class);
    private final ProfileImageService service = new ProfileImageService(storage, professionals);

    @AfterEach
    void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void validatesDecodedContentAndStoresWithOpaqueIdentifier() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(128, 128, BufferedImage.TYPE_INT_RGB), "png", output);
        var professional = new Profissional(1L, "PROF1");
        when(professionals.findByUsuarioIdForUpdate(1L)).thenReturn(java.util.Optional.of(professional));

        var updated = service.replace(1L,
                new MockMultipartFile("file", "photo.exe", "application/octet-stream", output.toByteArray()));

        assertThat(updated.getFotoPerfilUrl()).matches("profile-image:[0-9a-f-]{36}\\.png");
        verify(storage).store(any(), any());
    }

    @Test
    void rejectsPayloadWhoseDeclaredMimePretendsToBeImage() {
        var professional = new Profissional(1L, "PROF1");

        assertThatThrownBy(() -> service.replace(1L,
                new MockMultipartFile("file", "photo.png", "image/png", "not-image".getBytes())))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("PROFILE_IMAGE_INVALID");
    }

    @Test
    void removesNewFileWhenDatabaseUpdateRollsBack() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(128, 128, BufferedImage.TYPE_INT_RGB), "png", output);
        var professional = new Profissional(1L, "PROF1");
        when(professionals.findByUsuarioIdForUpdate(1L)).thenReturn(java.util.Optional.of(professional));
        doThrow(new DataIntegrityViolationException("synthetic failure"))
                .when(professionals).saveAndFlush(professional);
        TransactionSynchronizationManager.initSynchronization();

        assertThatThrownBy(() -> service.replace(1L,
                new MockMultipartFile("file", "photo.png", "image/png", output.toByteArray())))
                .isInstanceOf(DataIntegrityViolationException.class);

        TransactionSynchronizationManager.getSynchronizations().forEach(
                synchronization -> synchronization.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
        verify(storage).delete(any());
    }
}
