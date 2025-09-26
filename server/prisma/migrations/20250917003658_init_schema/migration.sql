/*
  Warnings:

  - You are about to drop the column `articles` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `loanCategory` on the `Loan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "articles";

-- AlterTable
ALTER TABLE "public"."Loan" DROP COLUMN "loanCategory";
