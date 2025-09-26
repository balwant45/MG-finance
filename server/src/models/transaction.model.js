
model Transaction {
  id        Int       @id @default(autoincrement())
  code      String
  date      DateTime
  amount    Decimal   @db.Decimal(10,2)
  type      String    // e.g., "Credit", "Debit"
  loanId    Int
  loan      Loan      @relation(fields: [loanId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}