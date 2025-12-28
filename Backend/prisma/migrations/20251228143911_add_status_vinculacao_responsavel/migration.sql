/*
  Warnings:

  - The `status_vinculo` column on the `ProfissionalCriança` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."StatusResponsavelVinculo" AS ENUM ('AGUARDANDO', 'VINCULADO', 'DESVINCULADO');

-- CreateEnum
CREATE TYPE "public"."StatusProfissionalVinculo" AS ENUM ('AGUARDANDO', 'VINCULADO', 'DESVINCULADO', 'SUSPENSO');

-- AlterTable
ALTER TABLE "public"."Crianca" ADD COLUMN     "status_vinculo_responsavel" "public"."StatusResponsavelVinculo" NOT NULL DEFAULT 'AGUARDANDO';

-- AlterTable
ALTER TABLE "public"."ProfissionalCriança" DROP COLUMN "status_vinculo",
ADD COLUMN     "status_vinculo" "public"."StatusProfissionalVinculo" NOT NULL DEFAULT 'AGUARDANDO';

-- DropEnum
DROP TYPE "public"."StatusVinculo";
