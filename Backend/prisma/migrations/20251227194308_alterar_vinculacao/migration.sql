/*
  Warnings:

  - Changed the type of `tipo_evento` on the `HistoricoVinculos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."StatusVinculacao" AS ENUM ('TOKEN_GERADO', 'TOKEN_USADO', 'TOKEN_EXPIRADO', 'TOKEN_CANCELADO', 'VINCULO_CRIADO', 'VINCULO_ENCERRADO');

-- DropForeignKey
ALTER TABLE "public"."HistoricoVinculos" DROP CONSTRAINT "HistoricoVinculos_responsavel_id_fkey";

-- AlterTable
ALTER TABLE "public"."HistoricoVinculos" ALTER COLUMN "responsavel_id" DROP NOT NULL,
DROP COLUMN "tipo_evento",
ADD COLUMN     "tipo_evento" "public"."StatusVinculacao" NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."HistoricoVinculos" ADD CONSTRAINT "HistoricoVinculos_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
