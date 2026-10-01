ALTER TABLE audit_logs
  ADD COLUMN evento VARCHAR(80),
  ADD COLUMN crianca_id BIGINT REFERENCES criancas(id),
  ADD COLUMN profissional_id BIGINT REFERENCES profissionais(id),
  ADD COLUMN user_agent VARCHAR(500),
  ADD COLUMN resultado VARCHAR(30) NOT NULL DEFAULT 'SUCESSO',
  ADD COLUMN metadados VARCHAR(1000);

UPDATE audit_logs SET evento = acao WHERE evento IS NULL;
ALTER TABLE audit_logs ALTER COLUMN evento SET NOT NULL;
CREATE INDEX idx_audit_evento_data ON audit_logs(evento, created_at DESC);
CREATE INDEX idx_audit_crianca_data ON audit_logs(crianca_id, created_at DESC);

ALTER TABLE historico_vinculos
  ADD COLUMN responsavel_id BIGINT REFERENCES usuarios(id),
  ADD COLUMN profissional_id BIGINT REFERENCES profissionais(id),
  ADD COLUMN status VARCHAR(30),
  ADD COLUMN motivo VARCHAR(255);

CREATE INDEX idx_historico_vinculo_crianca_data
  ON historico_vinculos(crianca_id, created_at DESC);
