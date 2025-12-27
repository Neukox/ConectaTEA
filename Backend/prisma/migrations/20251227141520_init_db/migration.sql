/*
  Warnings:

  - Added the required column `categoria` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prioridade` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo` to the `Meta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PrioridadeMeta" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "public"."StatusMeta" AS ENUM ('EM_ANDAMENTO', 'VENCENDO', 'QUASE_CONCLUIDA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "public"."CategoriaMeta" AS ENUM ('COMUNICACAO', 'SOCIAL', 'COGNITIVA', 'COMPORTAMENTAL');

-- AlterTable
ALTER TABLE "public"."Meta" ADD COLUMN     "categoria" "public"."CategoriaMeta" NOT NULL,
ADD COLUMN     "prioridade" "public"."PrioridadeMeta" NOT NULL,
ADD COLUMN     "progresso" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "public"."StatusMeta" NOT NULL DEFAULT 'EM_ANDAMENTO',
ADD COLUMN     "titulo" TEXT NOT NULL;
