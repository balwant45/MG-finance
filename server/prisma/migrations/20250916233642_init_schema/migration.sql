-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "contactNo" VARCHAR(20),
    "altContactNo" VARCHAR(20),
    "aadharNo" TEXT,
    "address" TEXT,
    "city" TEXT,
    "occupation" TEXT,
    "profileImageUrl" TEXT,
    "articles" INTEGER NOT NULL DEFAULT 0,
    "slNo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Loan" (
    "id" SERIAL NOT NULL,
    "loanNumber" TEXT NOT NULL,
    "loanDate" TIMESTAMP(3) NOT NULL,
    "loanType" TEXT NOT NULL,
    "loanCategory" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "loanAmount" DECIMAL(10,2) NOT NULL,
    "disbursedAmount" DECIMAL(10,2),
    "interestRate" DECIMAL(5,2),
    "interestAmount" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2),
    "emiAmount" DECIMAL(10,2),
    "totalEmi" INTEGER,
    "emiPaid" INTEGER NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2),
    "tenure" INTEGER,
    "installmentFrequency" TEXT,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Installment" (
    "id" SERIAL NOT NULL,
    "slNo" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "emiAmount" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "loanId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "loanId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guarantor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "relationToBorrower" TEXT,
    "phone" VARCHAR(20),
    "address" TEXT,
    "city" TEXT,
    "occupation" TEXT,
    "idProofType" TEXT,
    "idProofNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoanGuarantor" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "guarantorId" INTEGER NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanGuarantor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_aadharNo_key" ON "public"."Customer"("aadharNo");

-- CreateIndex
CREATE INDEX "Customer_contactNo_idx" ON "public"."Customer"("contactNo");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_loanNumber_key" ON "public"."Loan"("loanNumber");

-- CreateIndex
CREATE INDEX "Installment_loanId_slNo_idx" ON "public"."Installment"("loanId", "slNo");

-- CreateIndex
CREATE INDEX "Transaction_loanId_date_idx" ON "public"."Transaction"("loanId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Guarantor_idProofNumber_key" ON "public"."Guarantor"("idProofNumber");

-- CreateIndex
CREATE INDEX "Guarantor_name_phone_idx" ON "public"."Guarantor"("name", "phone");

-- CreateIndex
CREATE INDEX "LoanGuarantor_guarantorId_idx" ON "public"."LoanGuarantor"("guarantorId");

-- CreateIndex
CREATE INDEX "LoanGuarantor_loanId_idx" ON "public"."LoanGuarantor"("loanId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanGuarantor_loanId_guarantorId_key" ON "public"."LoanGuarantor"("loanId", "guarantorId");

-- AddForeignKey
ALTER TABLE "public"."Loan" ADD CONSTRAINT "Loan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Installment" ADD CONSTRAINT "Installment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "public"."Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "public"."Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanGuarantor" ADD CONSTRAINT "LoanGuarantor_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "public"."Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanGuarantor" ADD CONSTRAINT "LoanGuarantor_guarantorId_fkey" FOREIGN KEY ("guarantorId") REFERENCES "public"."Guarantor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
