# Plano de migração de dados Prisma/NestJS para Java/Flyway

## Escopo e condição de execução

Este documento é somente um plano. Nenhuma migração real foi executada. A origem é PostgreSQL gerido pelo Prisma em `Backend/prisma/schema.prisma`; o alvo é um banco PostgreSQL novo ou restaurável, criado pelas migrations Flyway V1 e V2 do `BackendJava`. A execução futura exige backup verificado, janela de manutenção, credenciais próprias do ambiente e aprovação operacional.

## Mapeamento principal

| Prisma/origem | Java/alvo | Transformação necessária |
|---|---|---|
| `User` | `usuarios` | `name→nome`, `password→password_hash`, `criado_em→created_at`; normalizar email para minúsculas; validar emails nulos/duplicados antes do índice único. Preservar hash compatível com BCrypt ou exigir redefinição, nunca copiar senha em texto. |
| `Profissional` | `profissionais` | Campos diretos; preservar `usuario_id`, IDs e código somente após validar unicidade. |
| `Crianca` | `criancas` + `vinculos_responsaveis_criancas` | `data_nascimento` vira `DATE`; diagnóstico/campos diretos. A FK obrigatória `responsavel_id` deixa de ser propriedade da criança e gera vínculo N:N. `parentesco` vai para o vínculo. |
| `ProfissionalCriança` | `vinculos_profissionais_criancas` | Chave composta de origem vira ID técnico; mapear `AGUARDANDO→` decisão manual ou exclusão controlada, `VINCULADO`, `DESVINCULADO`; `SUSPENSO` não possui equivalente automático e exige regra aprovada. |
| `TokenVinculo` | `tokens_vinculo` | Nunca copiar `codigo` bruto: calcular SHA-256 normalizado em `codigo_hash`; `AGUARDANDO→PENDENTE`; datas correspondentes. `usado_por` é evidência histórica, não coluna alvo atual. |
| `Consentimento` | `consentimentos` | `data_revogado→data_revogacao`, `ip_address→ip`; preencher `termo_versao` e `finalidade` com a versão efetivamente aplicável, sem inventar aceite. A unicidade antiga não deve eliminar eventos históricos. |
| `Meta` | `metas` | Datas de início/fim para `DATE`; campos e enums equivalentes; inicializar `version=0`. |
| `Progresso` | `progressos` | `progressoAnterior/Atual→progresso_anterior/atual`; preservar ordem temporal e FK. |
| `Sessoes` | `sessoes` | `data→data_hora`; demais campos diretos; confirmar timezone da origem antes de converter para `TIMESTAMPTZ`. |
| `ConexaoProfissional` | `conexoes_profissionais` | `solicitado_id→destinatario_id`; calcular `par_menor_id/par_maior_id`. Como o alvo aceita um par único, consolidar duplicatas por regra explícita e auditável antes da carga. |
| `AuditLog` | `audit_logs` | `userId→usuario_id`, `action→evento/acao`, `details→metadados`; sanitizar detalhes e rejeitar senha, JWT, cookie, token bruto, segredo e payload clínico. |
| `HistoricoVinculos` | `historico_vinculos` | `tipo_evento→evento`, `data_evento→created_at`, IDs diretos; descrição somente após revisão de conteúdo sensível. |
| `LocalAtendimento` | `locais_atendimento` | Preservar nome, cidade e profissional; validar duplicatas por profissional/nome/cidade. |
| `RedeSocial` | `redes_sociais` | Preservar tipo e URL HTTP(S); resolver tipos duplicados por profissional antes da carga. |
| `AreaAtuacao` | `areas_atuacao` | Preservar IDs e nome; consolidar duplicatas case-insensitive sem inventar catálogo. |
| `AreaAtuacaoProfissional` | `areas_atuacao_profissionais` | Preservar chave composta e carregar depois de profissionais e áreas. |

## IDs, relações e enums

Preservar IDs quando não houver colisão facilita rastreabilidade; após carga, ajustar cada sequence para `max(id)+1`. Carregar pais antes de filhos e validar todas as FKs. Enums devem ser transformados por tabela de correspondência versionada; valores sem equivalente (`AGUARDANDO`, `SUSPENSO` e eventuais dados inválidos) vão para relatório de exceções, nunca para conversão silenciosa.

## Ordem futura de carga

1. Congelar escrita no NestJS e gerar backup lógico e snapshot restaurável.
2. Criar banco alvo vazio com Flyway V1/V2 e `ddl-auto=validate`.
3. Extrair contagens, checksums lógicos, duplicidades, nulos e enums desconhecidos.
4. Carregar `usuarios`, `profissionais`, `criancas` e contatos pendentes.
5. Carregar vínculos e histórico; depois tokens e consentimentos.
6. Carregar metas, progressos, sessões e conexões.
7. Carregar auditoria já sanitizada e ajustar sequences.
8. Executar validação pós-carga e somente então liberar escrita no Java.

## Validação e rollback

Antes: validar restauração do backup, espaço, timezone, versão do BCrypt, duplicidade case-insensitive de email, relações órfãs e distribuição dos enums. Depois: comparar contagens por estado, amostras por ID, somas/checksums de campos não sensíveis, FKs, constraints, Flyway, Hibernate validate e consultas funcionais somente leitura. O rollback consiste em interromper o Java, restaurar o endpoint NestJS e o banco de origem intacto; nenhuma escrita concorrente pode ocorrer durante a janela. Se houve escrita no alvo, ela deve ser exportada para reconciliação, não copiada automaticamente de volta.

## Critérios para autorizar a execução futura

- scripts revisados e ensaiados em cópia anonimizada/segura;
- backup e restauração cronometrados e comprovados;
- decisões formais para enums sem equivalência e duplicatas de conexão;
- versão/finalidade de consentimento juridicamente revisadas;
- contrato Java e frontend integrado homologados;
- responsáveis, janela, monitoramento, critérios de abortar e plano de comunicação definidos.
