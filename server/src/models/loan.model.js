model Loan {
  id                Int       @id @default(autoincrement())
  loanNumber        String    @unique
  loanDate          DateTime
  loanType          String
  loanCategory      String
  status            String    // e.g., "Active", "Closed"
  loanAmount        Decimal   @db.Decimal(10,2)
  interestAmount    Decimal   @db.Decimal(10,2)
  totalAmount       Decimal   @db.Decimal(10,2) // loanAmount + interestAmount
  emiAmount         Decimal   @db.Decimal(10,2)
  totalEmi          Int
  emiPaid           Int       @default(0)
  balance           Decimal   @db.Decimal(10,2)
  customerId        Int
  customer          Customer  @relation(fields: [customerId], references: [id])
  installments      Installment[]
  transactions      Transaction[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}