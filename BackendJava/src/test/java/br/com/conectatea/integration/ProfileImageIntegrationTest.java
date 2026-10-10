package br.com.conectatea.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.conectatea.profissional.domain.Profissional;
import br.com.conectatea.profissional.infrastructure.ProfissionalRepository;
import br.com.conectatea.security.AuthenticatedUser;
import br.com.conectatea.usuario.domain.TipoUsuario;
import br.com.conectatea.usuario.domain.Usuario;
import br.com.conectatea.usuario.infrastructure.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class ProfileImageIntegrationTest extends PostgresIntegrationTest {
    private static final Path STORAGE;
    static {
        try { STORAGE = Files.createTempDirectory("conectatea-profile-test-"); }
        catch (Exception exception) { throw new ExceptionInInitializerError(exception); }
    }

    @DynamicPropertySource
    static void imageProperties(DynamicPropertyRegistry registry) {
        registry.add("app.profile-images.directory", STORAGE::toString);
    }

    @Autowired MockMvc mvc;
    @Autowired UsuarioRepository users;
    @Autowired ProfissionalRepository professionals;
    @Autowired ObjectMapper json;

    @Test
    void uploadPersistsAcrossRequestsThenReplacesLoadsAndRemoves() throws Exception {
        var account = users.save(new Usuario("Foto E2E", unique("foto"), "hash", null, null,
                TipoUsuario.PROFISSIONAL));
        professionals.save(new Profissional(account.getId(), "PROF-FOTO-" + account.getId()));
        var auth = authFor(account);

        var firstUpload = mvc.perform(multipart("/profissionais/me/foto")
                        .file(image("first.png", 96, 96, BufferedImage.TYPE_INT_RGB))
                        .with(authentication(auth)).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.fotoPerfilUrl").isNotEmpty())
                .andReturn();
        var firstUrl = json.readTree(firstUpload.getResponse().getContentAsByteArray())
                .get("fotoPerfilUrl").asText();
        assertThat(firstUrl).contains("/api/profissionais/fotos/");

        mvc.perform(get("/profissionais/me").with(authentication(auth)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.fotoPerfilUrl").value(firstUrl));
        mvc.perform(get(path(firstUrl)).with(authentication(auth)))
                .andExpect(status().isOk()).andExpect(result ->
                        assertThat(result.getResponse().getContentType()).isEqualTo(MediaType.IMAGE_PNG_VALUE));

        var replacement = mvc.perform(multipart("/profissionais/me/foto")
                        .file(image("second.png", 128, 128, BufferedImage.TYPE_INT_RGB))
                        .with(authentication(auth)).with(csrf()))
                .andExpect(status().isOk()).andReturn();
        var secondUrl = json.readTree(replacement.getResponse().getContentAsByteArray())
                .get("fotoPerfilUrl").asText();
        assertThat(secondUrl).isNotEqualTo(firstUrl);
        mvc.perform(get(path(firstUrl)).with(authentication(auth))).andExpect(status().isConflict());
        mvc.perform(get(path(secondUrl)).with(authentication(auth))).andExpect(status().isOk());

        mvc.perform(delete("/profissionais/me/foto").with(authentication(auth)).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/profissionais/me").with(authentication(auth)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.fotoPerfilUrl").doesNotExist());
        mvc.perform(get(path(secondUrl)).with(authentication(auth))).andExpect(status().isConflict());
    }

    @Test
    void rejectsInvalidImageAndOtherRole() throws Exception {
        var professional = users.save(new Usuario("Profissional", unique("prof"), "hash", null, null,
                TipoUsuario.PROFISSIONAL));
        professionals.save(new Profissional(professional.getId(), "PROF-X-" + professional.getId()));
        var guardian = users.save(new Usuario("Responsável", unique("resp"), "hash", null, null,
                TipoUsuario.RESPONSAVEL));

        mvc.perform(multipart("/profissionais/me/foto")
                        .file(new MockMultipartFile("file", "fake.png", "image/png", "fake".getBytes()))
                        .with(authentication(authFor(professional))).with(csrf()))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("PROFILE_IMAGE_INVALID"));
        mvc.perform(multipart("/profissionais/me/foto")
                        .file(image("photo.png", 96, 96, BufferedImage.TYPE_INT_RGB))
                        .with(authentication(authFor(guardian))).with(csrf()))
                .andExpect(status().isForbidden());
    }

    private MockMultipartFile image(String name, int width, int height, int type) throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(width, height, type), "png", output);
        return new MockMultipartFile("file", name, "image/png", output.toByteArray());
    }

    private UsernamePasswordAuthenticationToken authFor(Usuario user) {
        var principal = new AuthenticatedUser(user.getId(), user.getEmail(), user.getTipo());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getTipo().name())));
    }

    private String path(String absoluteUrl) { return java.net.URI.create(absoluteUrl).getPath().replaceFirst("^/api", ""); }
    private String unique(String prefix) { return prefix + "-" + System.nanoTime() + "@example.test"; }
}
