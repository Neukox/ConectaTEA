# ADR-004: Migração de banco

Aceito. Flyway controla o schema Java novo. Não há DROP automático nem importação implícita do Prisma. Dados reais exigem backup, script dedicado, validação de contagens/FKs e rollback.
