/*
  Warnings:

  - The values [AGUARDANDO] on the enum `StatusResponsavelVinculo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatusResponsavelVinculo_new" AS ENUM ('AGUARDANDO_VINCULO', 'VINCULADO', 'DESVINCULADO', 'CODIGO_EXPIRADO');
ALTER TABLE "public"."Crianca" ALTER COLUMN "status_vinculo_responsavel" DROP DEFAULT;
ALTER TABLE "public"."Crianca" ALTER COLUMN "status_vinculo_responsavel" TYPE "public"."StatusResponsavelVinculo_new" USING ("status_vinculo_responsavel"::text::"public"."StatusResponsavelVinculo_new");
ALTER TYPE "public"."StatusResponsavelVinculo" RENAME TO "StatusResponsavelVinculo_old";
ALTER TYPE "public"."StatusResponsavelVinculo_new" RENAME TO "StatusResponsavelVinculo";
DROP TYPE "public"."StatusResponsavelVinculo_old";
ALTER TABLE "public"."Crianca" ALTER COLUMN "status_vinculo_responsavel" SET DEFAULT 'AGUARDANDO_VINCULO';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Crianca" ALTER COLUMN "status_vinculo_responsavel" SET DEFAULT 'AGUARDANDO_VINCULO';
