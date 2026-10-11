ALTER TABLE notificacoes ADD COLUMN ocultada_sino BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_notificacoes_sino
  ON notificacoes(destinatario_usuario_id, ocultada_sino, created_at DESC);
