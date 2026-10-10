-- Preserva o alerta derivado antigo antes de normalizar para o estado de trabalho.
ALTER TABLE progressos ADD COLUMN status_legado VARCHAR(30);

UPDATE progressos
SET status_legado = status,
    status = 'EM_ANDAMENTO'
WHERE status IN ('VENCENDO', 'QUASE_CONCLUIDA');

ALTER TABLE progressos
  ADD CONSTRAINT ck_progressos_status_trabalho
  CHECK (status IN ('EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA'));

-- V8 usou CHAR(2), mas a propriedade Java é String/VARCHAR; conversão é sem perda.
ALTER TABLE criancas ALTER COLUMN uf TYPE VARCHAR(2) USING btrim(uf);
