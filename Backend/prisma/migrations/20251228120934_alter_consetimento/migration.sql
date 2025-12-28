/*
  Warnings:

  - You are about to drop the column `conteudo_termo` on the `Consentimento` table. All the data in the column will be lost.
  - You are about to drop the column `versao_termo` on the `Consentimento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Consentimento" DROP COLUMN "conteudo_termo",
DROP COLUMN "versao_termo";
