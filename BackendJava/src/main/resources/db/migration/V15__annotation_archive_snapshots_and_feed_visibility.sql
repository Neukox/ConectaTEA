-- Snapshot mínimo do arquivo próprio. Para registros legados, o nome abaixo é
-- uma captura técnica da migração, não uma afirmação histórica sobre o nome na criação.
ALTER TABLE anotacoes ADD COLUMN snapshot_crianca_id BIGINT;
ALTER TABLE anotacoes ADD COLUMN snapshot_crianca_nome VARCHAR(200);
ALTER TABLE anotacoes ADD COLUMN snapshot_capturado_em TIMESTAMPTZ;
ALTER TABLE anotacoes ADD COLUMN snapshot_origem VARCHAR(24);

UPDATE anotacoes a
SET snapshot_crianca_id = a.crianca_id,
    snapshot_crianca_nome = c.nome,
    snapshot_capturado_em = now(),
    snapshot_origem = 'MIGRACAO_V15'
FROM criancas c
WHERE c.id = a.crianca_id;

ALTER TABLE anotacoes ALTER COLUMN snapshot_crianca_id SET NOT NULL;
ALTER TABLE anotacoes ALTER COLUMN snapshot_capturado_em SET NOT NULL;
ALTER TABLE anotacoes ALTER COLUMN snapshot_origem SET NOT NULL;
ALTER TABLE anotacoes ADD CONSTRAINT ck_anotacao_snapshot_origem
  CHECK (snapshot_origem IN ('CRIACAO','MIGRACAO_V15'));

CREATE INDEX ix_anotacoes_arquivo_snapshot
  ON anotacoes(autor_profissional_id, created_at DESC, id DESC)
  INCLUDE (snapshot_crianca_id, snapshot_crianca_nome, snapshot_origem);

-- Eventos de gestão podem ser restritos a gestores, sem expor referências administrativas.
ALTER TABLE eventos_feed ADD COLUMN visibilidade VARCHAR(24) NOT NULL DEFAULT 'CIRCULO';
ALTER TABLE eventos_feed ADD CONSTRAINT ck_evento_feed_visibilidade
  CHECK (visibilidade IN ('CIRCULO','GESTORES'));
