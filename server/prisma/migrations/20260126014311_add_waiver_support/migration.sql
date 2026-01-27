-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "waiverAmount" DECIMAL(10,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "waiverAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
