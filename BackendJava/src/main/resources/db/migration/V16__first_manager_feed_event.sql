-- O primeiro gestor é aprovado pelo fluxo administrativo legado, ainda concentrado
-- no controller. A projeção nasce do histórico confirmado e participa da mesma
-- transação, sem copiar referência de verificação ou motivo administrativo.
CREATE OR REPLACE FUNCTION projetar_primeiro_gestor_no_feed()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.evento = 'PRIMEIRO_GESTOR_APROVADO' THEN
    INSERT INTO eventos_feed(
      crianca_id, ator_usuario_id, tipo, recurso_tipo, recurso_id,
      titulo, resumo, compartilhado, criado_em, visibilidade
    ) VALUES (
      NEW.crianca_id, NEW.ator_usuario_id, 'PRIMEIRO_GESTOR_APROVADO',
      'HISTORICO_VINCULO', NEW.id, 'Primeiro gestor aprovado',
      'A gestão inicial da criança foi aprovada.', true, NEW.created_at, 'GESTORES'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_primeiro_gestor_feed
AFTER INSERT ON historico_vinculos
FOR EACH ROW EXECUTE FUNCTION projetar_primeiro_gestor_no_feed();
