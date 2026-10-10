ALTER TABLE usuarios
  ADD COLUMN email_confirmado_em TIMESTAMPTZ;

CREATE TABLE email_verification_tokens (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expira_em TIMESTAMPTZ NOT NULL,
  consumido_em TIMESTAMPTZ,
  invalidado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verification_usuario_ativo
  ON email_verification_tokens(usuario_id, expira_em)
  WHERE consumido_em IS NULL AND invalidado_em IS NULL;

COMMENT ON COLUMN usuarios.email_confirmado_em IS
  'Confirma controle do email; não comprova autoridade ou guarda sobre criança';
