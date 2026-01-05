/*
  Warnings:

  - Added the required column `duracao` to the `Sessoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Sessoes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipoSessao" AS ENUM ('TERAPIA_INDIVIDUAL', 'TERAPIA_OCUPACIONAL', 'FONOAUDIOLOGIA', 'AVALIACAO');

-- CreateEnum
CREATE TYPE "public"."StatusSessao" AS ENUM ('AGENDADA', 'CONCLUIDA', 'EM_ANDAMENTO');

-- AlterTable
ALTER TABLE "public"."Sessoes" ADD COLUMN     "duracao" INTEGER NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "status" "public"."StatusSessao" NOT NULL DEFAULT 'AGENDADA',
ADD COLUMN     "tipo" "public"."TipoSessao" NOT NULL;
