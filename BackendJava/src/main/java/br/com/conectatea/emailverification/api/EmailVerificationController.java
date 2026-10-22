package br.com.conectatea.emailverification.api;

import br.com.conectatea.emailverification.application.EmailVerificationService;
import br.com.conectatea.security.AuthenticatedUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/email-verification")
@io.swagger.v3.oas.annotations.tags.Tag(name="Autenticação")
public class EmailVerificationController {
    public static final String NEUTRAL_MESSAGE="Se a conta existir e precisar de confirmação, enviaremos instruções.";
    private final EmailVerificationService service;
    public EmailVerificationController(EmailVerificationService service){this.service=service;}
    @PostMapping("/request") public Message request(@Valid @RequestBody Request body){service.request(body.email());return new Message(NEUTRAL_MESSAGE);}
    @PostMapping("/confirm") public Message confirm(@Valid @RequestBody Confirm body){service.confirm(body.token());return new Message("Email confirmado com sucesso.");}
    @GetMapping("/status") public EmailVerificationService.VerificationStatus status(Authentication authentication){return service.status(((AuthenticatedUser)authentication.getPrincipal()).id());}
    public record Request(@NotBlank @Email String email){}
    public record Confirm(@NotBlank String token){}
    public record Message(String message){}
}
