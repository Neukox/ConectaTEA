ALTER TABLE consentimentos
  ALTER COLUMN profissional_id DROP NOT NULL;

ALTER TABLE consentimentos
  ADD COLUMN tipo_aceite VARCHAR(40) NOT NULL DEFAULT 'RESPONSAVEL_COMPARTILHAMENTO';

ALTER TABLE consentimentos
  ADD CONSTRAINT ck_consentimentos_tipo_aceite
  CHECK (tipo_aceite IN ('RESPONSAVEL_COMPARTILHAMENTO'));

CREATE INDEX idx_convites_circulo_pendente_expiracao
  ON convites_circulo(crianca_id, destinatario_usuario_id, papel, expira_em)
  WHERE status = 'PENDENTE_ACEITE';

COMMENT ON COLUMN consentimentos.tipo_aceite IS
  'Aceite de compartilhamento familiar; aceite profissional permanece no convite e histórico de vínculo';
