-- Estados de prazo deixam de ser estados de trabalho. Nenhum conteúdo clínico é inferido.
UPDATE metas SET status = 'EM_ANDAMENTO' WHERE status IN ('VENCENDO', 'QUASE_CONCLUIDA');

ALTER TABLE metas
  ADD COLUMN pausada_em TIMESTAMPTZ,
  ADD COLUMN motivo_pausa VARCHAR(500),
  ADD CONSTRAINT ck_metas_status_trabalho CHECK (status IN ('EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA')),
  ADD CONSTRAINT ck_metas_pausa_coerente CHECK (
    (status = 'PAUSADA' AND pausada_em IS NOT NULL AND motivo_pausa IS NOT NULL AND btrim(motivo_pausa) <> '')
    OR (status <> 'PAUSADA' AND pausada_em IS NULL AND motivo_pausa IS NULL)
  );

CREATE TABLE eventos_metas (
  id BIGSERIAL PRIMARY KEY,
  meta_id BIGINT NOT NULL REFERENCES metas(id) ON DELETE RESTRICT,
  autor_profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PAUSA', 'RETOMADA')),
  motivo VARCHAR(500),
  prazo_anterior DATE,
  prazo_novo DATE,
  data TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_eventos_metas_meta_data ON eventos_metas(meta_id, data DESC);

ALTER TABLE criancas
  ADD COLUMN escola VARCHAR(160),
  ADD COLUMN escolaridade VARCHAR(120),
  ADD COLUMN cidade VARCHAR(120),
  ADD COLUMN uf CHAR(2),
  ADD COLUMN interesses TEXT,
  ADD COLUMN nivel_suporte SMALLINT,
  ADD CONSTRAINT ck_criancas_uf CHECK (uf IS NULL OR uf ~ '^[A-Z]{2}$'),
  ADD CONSTRAINT ck_criancas_nivel_suporte CHECK (nivel_suporte IS NULL OR nivel_suporte BETWEEN 1 AND 3);

CREATE INDEX idx_criancas_nome_lower ON criancas(lower(nome));
