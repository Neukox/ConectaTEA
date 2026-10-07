# Arquitetura de notificações

## Escopo

O módulo `br.com.conectatea.notificacao` entrega notificações internas persistentes e um canal externo de e-mail para mudanças relevantes em anotações compartilhadas. Ele segue as camadas `api`, `application`, `domain` e `infrastructure` do monólito modular.

## Consistência transacional

`AnotacaoService` altera a anotação, resolve destinatários e chama `NotificationService` dentro da mesma transação. As linhas de `notificacoes` são confirmadas ou revertidas junto com a alteração da anotação. A persistência interna não depende de listener em memória.

Depois de persistir, `NotificationsPersistedEvent` é tratado por `NotificationEmailListener` com `AFTER_COMMIT` e executor limitado. Falha externa nunca reverte a anotação nem apaga a notificação interna.

```text
BEGIN
  alterar anotação
  CareRecipientsProvider
  INSERT notificações
COMMIT
  evento AFTER_COMMIT
  EmailNotificationSender
  Brevo
```

## Destinatários e futuro Círculo de Cuidado

`NotificationService` depende somente de `CareRecipientsProvider`. `ActiveLinksCareRecipientsProvider` consulta vínculos com status `VINCULADO`, converte profissionais em usuários, elimina duplicidades, contas inativas e o ator.

Um futuro `CirculoDeCuidadoRecipientsProvider` poderá substituir essa estratégia sem alterar `NotificationService` ou `AnotacaoService`. Esta entrega não cria módulo nem tabelas artificiais de Círculo de Cuidado.

## Persistência e segurança

A migration V7 cria `notificacoes`. `anotacao_id` usa `ON DELETE SET NULL`, preservando histórico após exclusão física. Índices atendem destinatário, leitura e ordem temporal.

Os endpoints derivam o usuário exclusivamente de `AuthenticatedUser`. A consulta individual combina ID e destinatário para impedir IDOR. Notificação não concede acesso: criança, vínculo e visibilidade são revalidados pela API de Anotações.

## Brevo

`EmailNotificationSender` é uma porta própria. O adaptador Brevo reutiliza configuração, timeouts, sandbox e padrão REST existentes, sem reutilizar `PasswordResetNotifier`. Com `NOTIFICATION_EMAIL_ENABLED=false`, o adaptador no-op não acessa a rede.

O e-mail inclui apenas nome, mensagem genérica e CTA. Conteúdo clínico, diagnóstico, JWT, tokens e payload da anotação não entram no evento ou e-mail.

## Limitações do MVP

- sem Outbox ou retry durável para e-mail;
- sem WhatsApp, push, WebSocket ou SSE;
- sem preferências por usuário;
- listagem sem paginação, seguindo o padrão atual do projeto.

Outbox é a evolução indicada para garantia externa. Novos canais devem implementar portas próprias sem alterar Anotações.
