# ADR-007 — acesso a crianças arquivadas

## Status

Aceita na Fase 2.

## Decisão

As rotas clínicas padrão só autorizam uma criança quando ela não está arquivada
e existe vínculo ativo entre o usuário e a criança. O arquivamento remove a
criança das listagens e faz o acesso direto por ID falhar como acesso negado.

Não será criada nesta fase uma exceção implícita para histórico. Uma futura rota
histórica deverá ter contrato, papéis, finalidade e auditoria próprios antes de
expor dados de criança arquivada.

## Consequências

- reduz exposição acidental por ID após arquivamento;
- preserva os dados no banco sem exclusão física;
- operações de histórico continuam fora do escopo até decisão explícita.
