model Customer {
  id         Int       @id @default(autoincrement())
  name       String
  fatherName String
  address    String?
  city       String?
  occupation String?
  articles   Int       @default(0)
  guarantor  String?
  slNo       Int?
  loans      Loan[]    // One-to-many relationship
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}