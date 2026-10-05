CREATE TABLE anotacoes (
  id BIGSERIAL PRIMARY KEY,
  crianca_id BIGINT NOT NULL REFERENCES criancas(id) ON DELETE CASCADE,
  autor_profissional_id BIGINT NOT NULL REFERENCES profissionais(id),
  conteudo VARCHAR(3000) NOT NULL,
  visibilidade VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_anotacoes_conteudo CHECK (char_length(btrim(conteudo)) BETWEEN 10 AND 3000),
  CONSTRAINT ck_anotacoes_visibilidade CHECK (visibilidade IN ('PRIVADA', 'COMPARTILHADA'))
);

CREATE INDEX idx_anotacoes_crianca_created_at
  ON anotacoes(crianca_id, created_at DESC);

CREATE INDEX idx_anotacoes_autor_profissional
  ON anotacoes(autor_profissional_id);
