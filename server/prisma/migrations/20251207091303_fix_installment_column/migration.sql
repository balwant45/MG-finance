/*
  Warnings:

  - You are about to drop the column `slNo` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `slNo` on the `Installment` table. All the data in the column will be lost.
  - Added the required column `srNo` to the `Installment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Installment_loanId_slNo_idx";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "slNo";

-- AlterTable
ALTER TABLE "Installment" DROP COLUMN "slNo",
ADD COLUMN     "srNo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "endDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Installment_loanId_srNo_idx" ON "Installment"("loanId", "srNo");
