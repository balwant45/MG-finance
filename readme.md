# 💼 Loan Management System Backend

This is the backend for a full-featured loan management system built with **Node.js**, **Express**, **Prisma**, and **PostgreSQL**. It supports customer onboarding, loan tracking, EMI scheduling, daily collections, and guarantor management.

---

## 🚀 Tech Stack

- **Node.js** + **Express** – Server and routing
- **Prisma ORM** – Database modeling and querying
- **PostgreSQL** – Relational database
- **Multer** – File uploads (profile images)
- **Cloudinary** – Cloud image hosting
- **Postman** – API testing

---

## 📁 Project Structure

project-root/ 
│ 
├── controllers/ # Business logic 
├── routes/ # API endpoints 
├── middlewares/ # Multer config 
├── utils/ # Cloudinary helper 
├── uploads/ # Temporary image storage 
├── prisma/ # Prisma schema 
├── index.js # App entry point 
└── .env # Environment variables

---

## 🧱 Database Models

### ✅ Customer
Stores personal details and links to loans.

### ✅ Loan
Tracks loan details, EMIs, and status.

### ✅ Installment
Represents scheduled EMIs and payment status.

### ✅ Transaction
Logs payments and disbursements.

### ✅ Guarantor
Stores guarantor info and links to loans.

---

## ✅ Completed Features

### 👤 Customer APIs
- `POST /customers` – Create customer with profile image
- `GET /customers` – List all customers
- `GET /customers/:id` – Get customer by ID

### ☁️ Image Upload
- Multer saves image locally
- Cloudinary uploads and returns public URL
- URL stored in `profileImageUrl` field

---

## 📌 Upcoming Features

### 💳 Loan APIs
- `POST /loans` – Create new loan for a customer
- `GET /loans/:id` – View loan details
- `PUT /loans/:id` – Update loan status or balance

### 📆 Installment APIs
- `POST /installments/:loanId/pay` – Mark EMI as paid
- `GET /installments/:loanId` – View EMI schedule

### 📊 Transaction APIs
- `POST /transactions` – Record payment/disbursement
- `GET /transactions/:loanId` – View loan statement

### 👥 Guarantor APIs
- `POST /guarantors` – Add guarantor
- `GET /guarantors/:id` – View guarantor profile
- `POST /loans/:loanId/guarantors` – Link guarantor to loan

---

## 🧠 How to Add a Guarantor (Step-by-Step)

Guarantors are **not added during customer creation**. Instead, they are linked to loans after both customer and loan are created.

### 1. Create Guarantor
```http
POST /guarantors
Content-Type: application/json

{
  "name": "Raj Kumar",
  "relationToBorrower": "Brother",
  "phone": "9876543210",
  "address": "XYZ Street",
  "idProofType": "Aadhar",
  "idProofNumber": "1234-5678-9012"
}

api to build
Customer APIs
Endpoint	Purpose
GET /customers/search?name=tony&contactNo=9890	🔍 Search by name/contact
PUT /customers/:id/finance	💰 Update EMI, loan summary
GET /customers/:id/loans	📄 View all loans for a customer
GET /customers/:id/details	🧾 Full profile + loan summary
💸 Loan APIs
Endpoint	Purpose
POST /loans	🆕 Create a new loan
GET /loans/:id	📄 View loan details
PUT /loans/:id	✏️ Update loan status, balance, etc.
GET /loans?status=active&type=daily	🔍 Filter loans
GET /loans/:id/installments	📆 View EMI schedule
GET /loans/:id/transactions	📊 View payment history
📆 Installment APIs
Endpoint	Purpose
POST /installments/:loanId/pay	💵 Mark EMI as paid
GET /installments/:loanId	📋 View all installments
PUT /installments/:id	✏️ Update status (Paid, Overdue)
💳 Transaction APIs
Endpoint	Purpose
POST /transactions	💰 Record a payment or disbursement
GET /transactions/:loanId	📊 Loan statement
GET /transactions?date=2025-09-26	📅 Daily collection summary
👥 Guarantor APIs
Endpoint	Purpose
POST /guarantors	🆕 Add a guarantor
GET /guarantors/:id	📄 View guarantor profile
GET /guarantors/search?name=raj	🔍 Search by name/phone
POST /loans/:loanId/guarantors	🔗 Link guarantor to loan
📊 Dashboard APIs (for Admin Panel)
Endpoint	Purpose
GET /dashboard/summary	📈 Total loans, payments, balances
GET /dashboard/daily-collection?date=2025-09-26	📅 Daily collection report
GET /dashboard/loan-stats	📊 Min/Max loan, active vs closed
