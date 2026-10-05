CREATE TABLE password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_password_reset_token_state CHECK (used_at IS NULL OR invalidated_at IS NULL)
);

CREATE INDEX idx_password_reset_tokens_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX idx_password_reset_tokens_active ON password_reset_tokens(usuario_id, expires_at)
  WHERE used_at IS NULL AND invalidated_at IS NULL;
