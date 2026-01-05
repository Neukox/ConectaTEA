-- DropForeignKey
ALTER TABLE "public"."Progresso" DROP CONSTRAINT "Progresso_meta_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."Progresso" ADD CONSTRAINT "Progresso_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "public"."Meta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
