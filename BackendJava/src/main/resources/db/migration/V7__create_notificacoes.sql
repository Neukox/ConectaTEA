CREATE TABLE notificacoes (
  id BIGSERIAL PRIMARY KEY,
  destinatario_usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  ator_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  crianca_id BIGINT NOT NULL REFERENCES criancas(id) ON DELETE RESTRICT,
  anotacao_id BIGINT REFERENCES anotacoes(id) ON DELETE SET NULL,
  tipo VARCHAR(40) NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  mensagem VARCHAR(500) NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_notificacoes_tipo CHECK (tipo IN (
    'ANOTACAO_CRIADA',
    'ANOTACAO_EDITADA',
    'ANOTACAO_EXCLUIDA',
    'ANOTACAO_COMPARTILHADA',
    'ANOTACAO_TORNADA_PRIVADA'
  )),
  CONSTRAINT ck_notificacoes_leitura CHECK (
    (lida = FALSE AND lida_em IS NULL) OR (lida = TRUE AND lida_em IS NOT NULL)
  )
);

CREATE INDEX idx_notificacoes_destinatario
  ON notificacoes(destinatario_usuario_id);
CREATE INDEX idx_notificacoes_lida
  ON notificacoes(lida);
CREATE INDEX idx_notificacoes_created_at
  ON notificacoes(created_at DESC);
CREATE INDEX idx_notificacoes_destinatario_lida_created_at
  ON notificacoes(destinatario_usuario_id, lida, created_at DESC);
