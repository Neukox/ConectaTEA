-- CreateEnum
CREATE TYPE "public"."StatusVinculo" AS ENUM ('AGUARDANDO', 'VINCULADO', 'DESVINCULADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "public"."StatusTokenVinculo" AS ENUM ('AGUARDANDO', 'USADO', 'EXPIRADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "public"."ProfissionalCriança" ADD COLUMN     "data_desvinculo" TIMESTAMP(3),
ADD COLUMN     "data_vinculo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "motivo_desvinculo" TEXT,
ADD COLUMN     "status_vinculo" "public"."StatusVinculo" NOT NULL DEFAULT 'AGUARDANDO';

-- CreateTable
CREATE TABLE "public"."HistoricoVinculos" (
    "id" SERIAL NOT NULL,
    "responsavel_id" INTEGER NOT NULL,
    "profissional_id" INTEGER NOT NULL,
    "crianca_id" INTEGER NOT NULL,
    "tipo_evento" "public"."StatusVinculo" NOT NULL,
    "descricao" TEXT,
    "data_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoVinculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Consentimento" (
    "id" SERIAL NOT NULL,
    "responsavel_id" INTEGER NOT NULL,
    "profissional_id" INTEGER NOT NULL,
    "crianca_id" INTEGER NOT NULL,
    "versao_termo" TEXT NOT NULL,
    "conteudo_termo" TEXT NOT NULL,
    "aceito" BOOLEAN NOT NULL DEFAULT false,
    "data_aceite" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_revogado" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "Consentimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TokenVinculo" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "qr_code_url" TEXT,
    "profissional_id" INTEGER NOT NULL,
    "crianca_id" INTEGER NOT NULL,
    "status" "public"."StatusTokenVinculo" NOT NULL DEFAULT 'AGUARDANDO',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_expiracao" TIMESTAMP(3) NOT NULL,
    "data_uso" TIMESTAMP(3),
    "usado_por" INTEGER,

    CONSTRAINT "TokenVinculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricoVinculos_crianca_id_idx" ON "public"."HistoricoVinculos"("crianca_id");

-- CreateIndex
CREATE INDEX "HistoricoVinculos_profissional_id_idx" ON "public"."HistoricoVinculos"("profissional_id");

-- CreateIndex
CREATE INDEX "HistoricoVinculos_data_evento_idx" ON "public"."HistoricoVinculos"("data_evento");

-- CreateIndex
CREATE INDEX "Consentimento_crianca_id_idx" ON "public"."Consentimento"("crianca_id");

-- CreateIndex
CREATE INDEX "Consentimento_responsavel_id_idx" ON "public"."Consentimento"("responsavel_id");

-- CreateIndex
CREATE UNIQUE INDEX "Consentimento_crianca_id_responsavel_id_profissional_id_key" ON "public"."Consentimento"("crianca_id", "responsavel_id", "profissional_id");

-- CreateIndex
CREATE UNIQUE INDEX "TokenVinculo_codigo_key" ON "public"."TokenVinculo"("codigo");

-- CreateIndex
CREATE INDEX "TokenVinculo_profissional_id_idx" ON "public"."TokenVinculo"("profissional_id");

-- CreateIndex
CREATE INDEX "TokenVinculo_crianca_id_idx" ON "public"."TokenVinculo"("crianca_id");

-- CreateIndex
CREATE INDEX "TokenVinculo_codigo_idx" ON "public"."TokenVinculo"("codigo");

-- CreateIndex
CREATE INDEX "TokenVinculo_status_idx" ON "public"."TokenVinculo"("status");

-- AddForeignKey
ALTER TABLE "public"."HistoricoVinculos" ADD CONSTRAINT "HistoricoVinculos_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoricoVinculos" ADD CONSTRAINT "HistoricoVinculos_crianca_id_fkey" FOREIGN KEY ("crianca_id") REFERENCES "public"."Crianca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoricoVinculos" ADD CONSTRAINT "HistoricoVinculos_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consentimento" ADD CONSTRAINT "Consentimento_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consentimento" ADD CONSTRAINT "Consentimento_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consentimento" ADD CONSTRAINT "Consentimento_crianca_id_fkey" FOREIGN KEY ("crianca_id") REFERENCES "public"."Crianca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TokenVinculo" ADD CONSTRAINT "TokenVinculo_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TokenVinculo" ADD CONSTRAINT "TokenVinculo_crianca_id_fkey" FOREIGN KEY ("crianca_id") REFERENCES "public"."Crianca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TokenVinculo" ADD CONSTRAINT "TokenVinculo_usado_por_fkey" FOREIGN KEY ("usado_por") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
