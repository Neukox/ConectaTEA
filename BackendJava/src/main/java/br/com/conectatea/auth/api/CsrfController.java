package br.com.conectatea.auth.api;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Autenticação")
public class CsrfController {

    @GetMapping("/csrf")
    @io.swagger.v3.oas.annotations.Operation(summary = "Emitir token CSRF para operações mutáveis")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getToken());
    }

    public record CsrfResponse(String token) {
    }
}
