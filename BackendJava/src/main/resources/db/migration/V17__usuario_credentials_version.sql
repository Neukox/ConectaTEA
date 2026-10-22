ALTER TABLE usuarios
  ADD COLUMN credentials_version BIGINT NOT NULL DEFAULT 0;
