ALTER TABLE vinculos_responsaveis_criancas
  ADD COLUMN papel VARCHAR(30),
  ADD COLUMN version BIGINT NOT NULL DEFAULT 0,
  ADD CONSTRAINT ck_vrc_papel CHECK (papel IS NULL OR papel IN ('RESPONSAVEL', 'RESPONSAVEL_GESTOR'));

CREATE INDEX idx_vrc_crianca_papel_ativo
  ON vinculos_responsaveis_criancas(crianca_id, papel)
  WHERE status = 'VINCULADO';

-- Registros legados permanecem sem papel: não recebem gestão automaticamente.
COMMENT ON COLUMN vinculos_responsaveis_criancas.papel IS
  'NULL indica vínculo legado aguardando classificação explícita; nunca implica gestor';

CREATE TABLE convites_circulo (
  id BIGSERIAL PRIMARY KEY,
  crianca_id BIGINT NOT NULL REFERENCES criancas(id) ON DELETE RESTRICT,
  emissor_usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  destinatario_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT,
  destinatario_email VARCHAR(255),
  papel VARCHAR(30) NOT NULL CHECK (papel IN ('RESPONSAVEL', 'RESPONSAVEL_GESTOR', 'PROFISSIONAL')),
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('NOMINAL_GESTOR', 'CODIGO_NAO_NOMINAL', 'PROPOSTA_PROFISSIONAL')),
  status VARCHAR(30) NOT NULL CHECK (status IN ('PENDENTE_ACEITE', 'PENDENTE_APROVACAO', 'ACEITO', 'RECUSADO', 'CANCELADO', 'EXPIRADO')),
  codigo_hash VARCHAR(64) NOT NULL UNIQUE,
  aprovado_por_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT,
  aprovado_em TIMESTAMPTZ,
  reservado_por_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT,
  reservado_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ NOT NULL,
  consumido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT ck_convite_destino_nominal CHECK (
    tipo <> 'NOMINAL_GESTOR' OR (destinatario_usuario_id IS NOT NULL AND destinatario_email IS NOT NULL)
  ),
  CONSTRAINT ck_convite_aprovacao CHECK (
    tipo <> 'NOMINAL_GESTOR' OR (aprovado_por_usuario_id IS NOT NULL AND aprovado_em IS NOT NULL)
  )
);
CREATE INDEX idx_convites_circulo_crianca_status ON convites_circulo(crianca_id, status);
CREATE INDEX idx_convites_circulo_destinatario_status ON convites_circulo(destinatario_usuario_id, status);

CREATE TABLE solicitacoes_circulo (
  id BIGSERIAL PRIMARY KEY,
  convite_id BIGINT NOT NULL REFERENCES convites_circulo(id) ON DELETE RESTRICT,
  crianca_id BIGINT NOT NULL REFERENCES criancas(id) ON DELETE RESTRICT,
  solicitante_usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  status VARCHAR(30) NOT NULL CHECK (status IN ('PENDENTE', 'APROVADA', 'RECUSADA', 'CANCELADA')),
  decidida_por_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT,
  decidida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version BIGINT NOT NULL DEFAULT 0,
  UNIQUE(convite_id, solicitante_usuario_id)
);
CREATE INDEX idx_solicitacoes_circulo_crianca_status
  ON solicitacoes_circulo(crianca_id, status);

-- Ponte segura para códigos legados: posse cria solicitação, nunca vínculo direto.
CREATE TABLE solicitacoes_token_vinculo (
  id BIGSERIAL PRIMARY KEY,
  token_id BIGINT NOT NULL REFERENCES tokens_vinculo(id) ON DELETE RESTRICT,
  crianca_id BIGINT NOT NULL REFERENCES criancas(id) ON DELETE RESTRICT,
  solicitante_usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  status VARCHAR(30) NOT NULL CHECK (status IN ('PENDENTE', 'APROVADA', 'RECUSADA')),
  ip VARCHAR(64),
  user_agent VARCHAR(500),
  decidida_por_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT,
  decidida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version BIGINT NOT NULL DEFAULT 0,
  UNIQUE(token_id, solicitante_usuario_id)
);
CREATE INDEX idx_solicitacoes_token_crianca_status
  ON solicitacoes_token_vinculo(crianca_id, status);
