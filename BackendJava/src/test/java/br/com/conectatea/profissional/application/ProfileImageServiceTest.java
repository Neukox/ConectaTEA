package br.com.conectatea.profissional.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.shared.domain.BusinessRuleException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class ProfileImageServiceTest {
    private final ProfileImageStorage storage = mock(ProfileImageStorage.class);
    private final ProfileImageService service = new ProfileImageService(storage);

    @Test
    void validatesDecodedContentAndStoresWithOpaqueIdentifier() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(128, 128, BufferedImage.TYPE_INT_RGB), "png", output);
        var professional = new Profissional(1L, "PROF1");

        var url = service.replace(professional,
                new MockMultipartFile("file", "photo.exe", "application/octet-stream", output.toByteArray()));

        assertThat(url).matches("/profissionais/fotos/[0-9a-f-]{36}\\.png");
        verify(storage).store(any(), any());
    }

    @Test
    void rejectsPayloadWhoseDeclaredMimePretendsToBeImage() {
        var professional = new Profissional(1L, "PROF1");

        assertThatThrownBy(() -> service.replace(professional,
                new MockMultipartFile("file", "photo.png", "image/png", "not-image".getBytes())))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo("PROFILE_IMAGE_INVALID");
    }
}
