model Installment {
  id           Int       @id @default(autoincrement())
  slNo         Int
  dueDate      DateTime
  emiAmount    Decimal   @db.Decimal(10,2)
  amount       Decimal   @db.Decimal(10,2) // actual paid amount
  balance      Decimal   @db.Decimal(10,2)
  status       String    // e.g., "Paid", "Pending"
  loanId       Int
  loan         Loan      @relation(fields: [loanId], references: [id])
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}