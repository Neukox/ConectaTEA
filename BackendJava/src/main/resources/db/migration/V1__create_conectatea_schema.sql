CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY, nome VARCHAR(150) NOT NULL, email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(100) NOT NULL, telefone VARCHAR(20), endereco VARCHAR(255),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PROFISSIONAL','RESPONSAVEL')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uk_usuarios_email_lower ON usuarios (lower(email));

CREATE TABLE profissionais (
  id BIGSERIAL PRIMARY KEY, usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id),
  especialidade VARCHAR(120), registro_profissional VARCHAR(80), titulo VARCHAR(120), formacao_academica TEXT,
  sobre TEXT, foto_perfil_url TEXT, codigo_identificacao VARCHAR(32) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE criancas (
  id BIGSERIAL PRIMARY KEY, nome VARCHAR(150) NOT NULL, data_nascimento DATE NOT NULL,
  genero VARCHAR(40), diagnostico TEXT, diagnostico_detalhes TEXT, observacoes TEXT, arquivada BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE contatos_responsaveis_pendentes (
  id BIGSERIAL PRIMARY KEY, crianca_id BIGINT NOT NULL REFERENCES criancas(id), nome VARCHAR(150), email VARCHAR(255), telefone VARCHAR(20), parentesco VARCHAR(40), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE vinculos_profissionais_criancas (
  id BIGSERIAL PRIMARY KEY, profissional_id BIGINT NOT NULL REFERENCES profissionais(id), crianca_id BIGINT NOT NULL REFERENCES criancas(id),
  status VARCHAR(30) NOT NULL, data_vinculo TIMESTAMPTZ, data_desvinculo TIMESTAMPTZ, motivo_desvinculo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(profissional_id, crianca_id)
);
CREATE INDEX idx_vpc_crianca_status ON vinculos_profissionais_criancas(crianca_id,status);
CREATE TABLE vinculos_responsaveis_criancas (
  id BIGSERIAL PRIMARY KEY, responsavel_id BIGINT NOT NULL REFERENCES usuarios(id), crianca_id BIGINT NOT NULL REFERENCES criancas(id),
  parentesco VARCHAR(40), principal BOOLEAN NOT NULL DEFAULT FALSE, status VARCHAR(30) NOT NULL,
  data_vinculo TIMESTAMPTZ, data_desvinculo TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(responsavel_id, crianca_id)
);
CREATE INDEX idx_vrc_crianca_status ON vinculos_responsaveis_criancas(crianca_id,status);
CREATE TABLE tokens_vinculo (
  id BIGSERIAL PRIMARY KEY, codigo_hash VARCHAR(64) NOT NULL UNIQUE, crianca_id BIGINT NOT NULL REFERENCES criancas(id),
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id), status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
  expira_em TIMESTAMPTZ NOT NULL, usado_em TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_tokens_status_expira ON tokens_vinculo(status,expira_em);
CREATE TABLE consentimentos (
  id BIGSERIAL PRIMARY KEY, responsavel_id BIGINT NOT NULL REFERENCES usuarios(id), crianca_id BIGINT NOT NULL REFERENCES criancas(id),
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id), aceito BOOLEAN NOT NULL, termo_versao VARCHAR(30) NOT NULL,
  finalidade VARCHAR(255) NOT NULL, data_aceite TIMESTAMPTZ NOT NULL, data_revogacao TIMESTAMPTZ, ip VARCHAR(64), user_agent VARCHAR(500), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE metas (
  id BIGSERIAL PRIMARY KEY, titulo VARCHAR(160) NOT NULL, descricao TEXT, categoria VARCHAR(30) NOT NULL, prioridade VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL, progresso INTEGER NOT NULL DEFAULT 0 CHECK(progresso BETWEEN 0 AND 100), data_inicio DATE NOT NULL, data_fim DATE NOT NULL,
  crianca_id BIGINT NOT NULL REFERENCES criancas(id), profissional_id BIGINT NOT NULL REFERENCES profissionais(id), version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_metas_crianca_status ON metas(crianca_id,status); CREATE INDEX idx_metas_profissional ON metas(profissional_id);
CREATE TABLE progressos (
  id BIGSERIAL PRIMARY KEY, meta_id BIGINT NOT NULL REFERENCES metas(id) ON DELETE CASCADE, profissional_id BIGINT NOT NULL REFERENCES profissionais(id),
  progresso_anterior INTEGER NOT NULL, progresso_atual INTEGER NOT NULL, status VARCHAR(30) NOT NULL, descricao TEXT, data TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_progressos_meta_data ON progressos(meta_id,data DESC);
CREATE TABLE sessoes (
  id BIGSERIAL PRIMARY KEY, data_hora TIMESTAMPTZ NOT NULL, duracao INTEGER NOT NULL CHECK(duracao > 0), status VARCHAR(30) NOT NULL,
  tipo VARCHAR(40) NOT NULL, descricao TEXT, observacoes TEXT, crianca_id BIGINT NOT NULL REFERENCES criancas(id), profissional_id BIGINT NOT NULL REFERENCES profissionais(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessoes_crianca_data ON sessoes(crianca_id,data_hora); CREATE INDEX idx_sessoes_profissional_data ON sessoes(profissional_id,data_hora);
CREATE TABLE conexoes_profissionais (
  id BIGSERIAL PRIMARY KEY, solicitante_id BIGINT NOT NULL REFERENCES profissionais(id), destinatario_id BIGINT NOT NULL REFERENCES profissionais(id),
  par_menor_id BIGINT NOT NULL, par_maior_id BIGINT NOT NULL, status VARCHAR(20) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(solicitante_id <> destinatario_id), UNIQUE(par_menor_id,par_maior_id)
);
CREATE TABLE historico_vinculos (
  id BIGSERIAL PRIMARY KEY, crianca_id BIGINT NOT NULL REFERENCES criancas(id), ator_usuario_id BIGINT REFERENCES usuarios(id), evento VARCHAR(50) NOT NULL, detalhes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY, usuario_id BIGINT REFERENCES usuarios(id), acao VARCHAR(50) NOT NULL, recurso VARCHAR(80), recurso_id BIGINT, ip VARCHAR(64), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_usuario_data ON audit_logs(usuario_id,created_at DESC);

