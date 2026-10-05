ALTER TABLE usuarios
  ADD COLUMN credentials_updated_at TIMESTAMPTZ;

UPDATE usuarios
SET credentials_updated_at = date_trunc('second', created_at)
WHERE credentials_updated_at IS NULL;

ALTER TABLE usuarios
  ALTER COLUMN credentials_updated_at SET NOT NULL,
  ALTER COLUMN credentials_updated_at SET DEFAULT date_trunc('second', now());
