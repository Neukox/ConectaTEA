package br.com.conectatea.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    public static final String AUTH_COOKIE = "cookieAuth";

    @Bean
    OpenAPI conectaTeaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ConectaTEA API")
                        .version("1.0")
                        .description("API REST do monólito modular Java/Spring Boot. "
                                + "A autenticação usa o cookie HttpOnly 'jwt', criado por POST /auth/login. "
                                + "Operações mutáveis também exigem CSRF: obtenha GET /auth/csrf e envie "
                                + "o cookie XSRF-TOKEN no header X-XSRF-TOKEN. A documentação não desabilita CSRF."))
                .components(new Components().addSecuritySchemes(AUTH_COOKIE,
                        new SecurityScheme()
                                .name("jwt")
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .description("JWT emitido pelo login em cookie HttpOnly; não use Authorization Bearer.")))
                .addSecurityItem(new SecurityRequirement().addList(AUTH_COOKIE))
                .tags(List.of(
                        tag("Autenticação", "Login, logout, sessão autenticada e CSRF"),
                        tag("Usuários", "Cadastro e conta do usuário autenticado"),
                        tag("Profissionais", "Diretório e perfil profissional"),
                        tag("Perfil Profissional", "Locais, redes sociais e áreas de atuação do próprio profissional"),
                        tag("Crianças", "Cadastro e consulta com autorização relacional"),
                        tag("Vínculos", "Tokens, consentimento e vínculos de responsáveis"),
                        tag("Metas", "Metas terapêuticas e atualização de progresso"),
                        tag("Progresso", "Consultas consolidadas de progresso"),
                        tag("Sessões", "Agenda e sessões de atendimento"),
                        tag("Conexões", "Conexões entre profissionais"),
                        tag("Dashboards", "Visões resumidas por papel")));
    }

    private Tag tag(String name, String description) {
        return new Tag().name(name).description(description);
    }
}
