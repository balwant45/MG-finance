-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_loanId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Loan_Repayment',
ALTER COLUMN "loanId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
