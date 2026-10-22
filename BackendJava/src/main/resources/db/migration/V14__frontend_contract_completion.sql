-- Contratos aprovados para o novo frontend. Migração aditiva e segura para dados legados.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS administrador BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE criancas ADD COLUMN IF NOT EXISTS status_acompanhamento VARCHAR(32) NOT NULL DEFAULT 'PENDENTE_CLASSIFICACAO';
ALTER TABLE criancas ADD COLUMN IF NOT EXISTS status_alterado_em TIMESTAMPTZ;
ALTER TABLE criancas ADD COLUMN IF NOT EXISTS status_alterado_por BIGINT REFERENCES usuarios(id);
ALTER TABLE criancas ADD COLUMN IF NOT EXISTS status_motivo VARCHAR(500);
ALTER TABLE criancas ADD CONSTRAINT ck_crianca_status_acompanhamento CHECK
 (status_acompanhamento IN ('PENDENTE_CLASSIFICACAO','EM_ACOMPANHAMENTO','PAUSADO','ENCERRADO'));

CREATE TABLE pedidos_primeiro_gestor (
 id BIGSERIAL PRIMARY KEY, crianca_id BIGINT NOT NULL REFERENCES criancas(id), solicitante_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
 vinculo_declarado VARCHAR(120) NOT NULL, responsavel_legal_declarado BOOLEAN NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', operador_usuario_id BIGINT REFERENCES usuarios(id),
 referencia_verificacao VARCHAR(300), motivo_decisao VARCHAR(500), criado_em TIMESTAMPTZ NOT NULL DEFAULT now(), decidido_em TIMESTAMPTZ,
 CONSTRAINT ck_pedido_gestor_status CHECK (status IN ('PENDENTE','APROVADO','RECUSADO'))
);
CREATE UNIQUE INDEX uq_pedido_gestor_pendente ON pedidos_primeiro_gestor(crianca_id) WHERE status='PENDENTE';
CREATE INDEX ix_pedido_gestor_status_criado ON pedidos_primeiro_gestor(status,criado_em,id);

CREATE TABLE historico_crianca (
 id BIGSERIAL PRIMARY KEY, crianca_id BIGINT NOT NULL REFERENCES criancas(id), autor_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
 tipo VARCHAR(50) NOT NULL, estado_anterior VARCHAR(40), estado_novo VARCHAR(40), motivo VARCHAR(500) NOT NULL, criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_historico_crianca_crianca ON historico_crianca(crianca_id,criado_em,id);

ALTER TABLE sessoes RENAME COLUMN observacoes TO observacao_privada;
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS modalidade VARCHAR(20) NOT NULL DEFAULT 'PRESENCIAL';
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS local_instrucoes VARCHAR(500);
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS anotacao_id BIGINT REFERENCES anotacoes(id);
ALTER TABLE sessoes ADD CONSTRAINT ck_sessao_modalidade CHECK (modalidade IN ('PRESENCIAL','ONLINE'));
UPDATE sessoes SET status='REALIZADA' WHERE status='CONCLUIDA';
-- Estados legados sem equivalente final comprovado permanecem agendados; não inferimos realização.
UPDATE sessoes SET status='AGENDADA' WHERE status IN ('PENDENTE','EM_ANDAMENTO');
ALTER TABLE sessoes ADD CONSTRAINT ck_sessao_status_v14 CHECK (status IN ('AGENDADA','REALIZADA','CANCELADA','NAO_COMPARECEU')) NOT VALID;
ALTER TABLE sessoes VALIDATE CONSTRAINT ck_sessao_status_v14;

CREATE TABLE historico_sessao (
 id BIGSERIAL PRIMARY KEY, sessao_id BIGINT NOT NULL REFERENCES sessoes(id), autor_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
 tipo VARCHAR(40) NOT NULL, status_anterior VARCHAR(30), status_novo VARCHAR(30), inicio_anterior TIMESTAMPTZ, inicio_novo TIMESTAMPTZ,
 motivo VARCHAR(500), criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_historico_sessao_sessao ON historico_sessao(sessao_id,criado_em,id);

ALTER TABLE metas ADD COLUMN IF NOT EXISTS concluida_em TIMESTAMPTZ;
ALTER TABLE metas ADD COLUMN IF NOT EXISTS resumo_resultado TEXT;
ALTER TABLE metas ADD COLUMN IF NOT EXISTS reaberta_em TIMESTAMPTZ;

ALTER TABLE anotacoes ADD COLUMN IF NOT EXISTS titulo VARCHAR(100);
ALTER TABLE anotacoes ADD COLUMN IF NOT EXISTS temas TEXT;
ALTER TABLE anotacoes ADD COLUMN IF NOT EXISTS sessao_id BIGINT REFERENCES sessoes(id);
ALTER TABLE anotacoes ADD COLUMN IF NOT EXISTS compartilhada_em TIMESTAMPTZ;
UPDATE anotacoes SET titulo='Anotação sem título' WHERE titulo IS NULL;
ALTER TABLE anotacoes ALTER COLUMN titulo SET NOT NULL;

CREATE TABLE versoes_anotacao (
 id BIGSERIAL PRIMARY KEY, anotacao_id BIGINT NOT NULL REFERENCES anotacoes(id), numero INTEGER NOT NULL,
 titulo VARCHAR(100) NOT NULL, conteudo TEXT NOT NULL, temas TEXT, motivo_correcao VARCHAR(500), autor_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
 criado_em TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(anotacao_id,numero)
);
CREATE INDEX ix_versao_anotacao ON versoes_anotacao(anotacao_id,numero DESC);

CREATE TABLE eventos_feed (
 id BIGSERIAL PRIMARY KEY, crianca_id BIGINT NOT NULL REFERENCES criancas(id), ator_usuario_id BIGINT REFERENCES usuarios(id),
 tipo VARCHAR(50) NOT NULL, recurso_tipo VARCHAR(30) NOT NULL, recurso_id BIGINT NOT NULL,
 titulo VARCHAR(200) NOT NULL, resumo VARCHAR(500), compartilhado BOOLEAN NOT NULL DEFAULT TRUE, criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_feed_crianca_cursor ON eventos_feed(crianca_id,criado_em DESC,id DESC) WHERE compartilhado;

CREATE INDEX ix_sessoes_proximas ON sessoes(crianca_id,status,data_hora,id);
CREATE INDEX ix_metas_resumo ON metas(crianca_id,status,categoria);
CREATE INDEX ix_anotacoes_arquivo_autor ON anotacoes(autor_profissional_id,created_at,id);

CREATE TABLE tarefas_limpeza_arquivo (
 id BIGSERIAL PRIMARY KEY, chave VARCHAR(255) NOT NULL, motivo VARCHAR(255) NOT NULL,
 tentativas INTEGER NOT NULL DEFAULT 0, proxima_tentativa_em TIMESTAMPTZ NOT NULL DEFAULT now(),
 concluida_em TIMESTAMPTZ, ultimo_erro VARCHAR(500), criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_limpeza_arquivo_pendente ON tarefas_limpeza_arquivo(proxima_tentativa_em,id) WHERE concluida_em IS NULL;

-- Não há expurgo automático: a política definitiva de retenção permanece decisão de lançamento.
