CREATE TABLE locais_atendimento (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  cidade VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_locais_atendimento_nome CHECK (btrim(nome) <> ''),
  CONSTRAINT ck_locais_atendimento_cidade CHECK (btrim(cidade) <> ''),
  CONSTRAINT uk_locais_atendimento_profissional_nome_cidade UNIQUE (profissional_id, nome, cidade)
);
CREATE INDEX idx_locais_atendimento_profissional ON locais_atendimento(profissional_id);

CREATE TABLE redes_sociais (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  tipo VARCHAR(60) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_redes_sociais_tipo CHECK (btrim(tipo) <> ''),
  CONSTRAINT ck_redes_sociais_url CHECK (url ~* '^https?://'),
  CONSTRAINT uk_redes_sociais_profissional_tipo UNIQUE (profissional_id, tipo)
);
CREATE INDEX idx_redes_sociais_profissional ON redes_sociais(profissional_id);

CREATE TABLE areas_atuacao (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_areas_atuacao_nome CHECK (btrim(nome) <> '')
);
CREATE UNIQUE INDEX uk_areas_atuacao_nome_lower ON areas_atuacao(lower(nome));

CREATE TABLE areas_atuacao_profissionais (
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  area_id BIGINT NOT NULL REFERENCES areas_atuacao(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profissional_id, area_id)
);
CREATE INDEX idx_areas_atuacao_profissionais_area ON areas_atuacao_profissionais(area_id);
