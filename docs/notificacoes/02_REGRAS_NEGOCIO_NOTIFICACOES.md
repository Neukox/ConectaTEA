# Regras de negócio de notificações

| Operação | Interna | E-mail | Tipo |
|---|---:|---:|---|
| criar privada | não | não | — |
| editar privada | não | não | — |
| excluir privada | não | não | — |
| criar compartilhada | sim | sim | `ANOTACAO_CRIADA` |
| editar compartilhada | sim | sim | `ANOTACAO_EDITADA` |
| excluir compartilhada | sim | sim | `ANOTACAO_EXCLUIDA` |
| privada → compartilhada | sim | sim | `ANOTACAO_COMPARTILHADA` |
| compartilhada → privada | sim | sim | `ANOTACAO_TORNADA_PRIVADA` |

Na mudança para privada, antigos destinatários recebem somente informação genérica. A notificação antiga não mantém acesso ao conteúdo.

Recebem profissionais e responsáveis com vínculo ativo. O ator é excluído e a identidade de deduplicação é `usuarioId`; contas inativas são ignoradas.

Título, mensagem, e-mail e auditoria nunca contêm conteúdo da anotação. Nome da criança e ator podem aparecer porque o destinatário foi resolvido por vínculo ativo, mas a autorização atual sempre prevalece.

Leitura individual e em massa afetam apenas o usuário autenticado. O sino do frontend exibe contador, loading, erro, vazio e lista persistente. Toasts continuam sendo feedback temporário separado.
