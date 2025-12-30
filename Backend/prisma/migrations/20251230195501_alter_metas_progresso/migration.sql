/*
  Warnings:

  - Added the required column `profissional_id` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profissional_id` to the `Progresso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progressoAnterior` to the `Progresso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progressoAtual` to the `Progresso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Meta" ADD COLUMN     "profissional_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Progresso" ADD COLUMN     "profissional_id" INTEGER NOT NULL,
ADD COLUMN     "progressoAnterior" INTEGER NOT NULL,
ADD COLUMN     "progressoAtual" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Meta_crianca_id_idx" ON "public"."Meta"("crianca_id");

-- CreateIndex
CREATE INDEX "Meta_profissional_id_idx" ON "public"."Meta"("profissional_id");

-- CreateIndex
CREATE INDEX "Meta_data_inicio_idx" ON "public"."Meta"("data_inicio");

-- CreateIndex
CREATE INDEX "Meta_data_fim_idx" ON "public"."Meta"("data_fim");

-- CreateIndex
CREATE INDEX "Progresso_meta_id_idx" ON "public"."Progresso"("meta_id");

-- CreateIndex
CREATE INDEX "Progresso_data_idx" ON "public"."Progresso"("data");

-- AddForeignKey
ALTER TABLE "public"."Meta" ADD CONSTRAINT "Meta_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Progresso" ADD CONSTRAINT "Progresso_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
