// import { PrismaClient } from '@prisma/client';
// import Decimal from 'decimal.js';
// // Import your existing controller logic
// // Make sure this path is correct relative to your seed.js file location
// import { generateInstallmentsForLoan } from '../src/controllers/Installment.controllers.js'; 

// // Initialize Prisma for the seed script
// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Start seeding...');

//   // --- Helper Function for Loan Calculations ---
//   // (This mimics your frontend calculation logic)
//   const calculateLoanData = (loanAmount, interestRate, totalEmi) => {
//     const principal = new Decimal(loanAmount);
//     const interestRatePercentage = new Decimal(interestRate);
//     const totalEmiNum = totalEmi;

//     const oneHundred = new Decimal(100);

//     // Total Interest: Principal * (Rate / 100)
//     const calculatedInterestAmount = principal.mul(interestRatePercentage).div(oneHundred);

//     // Total Payable: Principal + Interest
//     const calculatedTotalAmount = principal.add(calculatedInterestAmount);

//     // EMI Amount: Total Amount / Total EMIs
//     let calculatedEmiAmount = new Decimal(0);
//     if (totalEmiNum > 0) {
//       const totalEmiDecimal = new Decimal(totalEmiNum);
//       calculatedEmiAmount = calculatedTotalAmount.div(totalEmiDecimal);
//       calculatedEmiAmount = calculatedEmiAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
//     }

//     return {
//       interestAmount: calculatedInterestAmount, // Pass as Decimal directly to Prisma
//       totalAmount: calculatedTotalAmount,
//       emiAmount: calculatedEmiAmount,
//       balance: calculatedTotalAmount,
//       totalEmi: totalEmiNum,
//     };
//   };

//   // --- 1. Define Customer and Loan Data ---
//   const customerData = [
//     {
//       name: 'Harmandeep singh',
//       fatherName: 'Harpal singh',
//       contactNo: '6280139908',
//       aadharNo: '1111-2222-3333',
//       occupation: 'Electrician',
//       city: 'Amritsar',
//       address: 'Near Golden Temple',
//       loanDetails: {
//         loanAmount: 30000,
//         interestRate: 26.6,
//         totalEmi: 20,
//         loanDate: '2025-12-04',
//         loanNumber: 'MG-2025-029',
//         loanType: 'weekly',
//         status: 'Active',
//         installmentFrequency: 'Weekly', // Ensure casing matches your enum/logic (Weekly vs weekly)
//         tenure: 100,
//       }
//     },
//     {
//       name: 'Buta singh',
//       fatherName: 'Kartar singh',
//       contactNo: '9872922934',
//       aadharNo: '9661-8664-0247',
//       occupation: 'Carpenter',
//       city: 'Bathinda',
//       address: 'Near Bus Stand street no. 3',
//       loanDetails: {
//         loanAmount: 20000,
//         interestRate: 20,
//         totalEmi: 20,
//         loanDate: '2025-12-05',
//         loanNumber: 'MG-2025-030',
//         loanType: 'weekly',
//         status: 'Active',
//         installmentFrequency: 'Weekly',
//         tenure: 100,
//       }
//     },
//     {
//       name: 'Davinder Singh',
//       fatherName: 'Hardev Singh',
//       contactNo: '9815423703',
//       aadharNo: '3333-2222-7536',
//       occupation: 'Carpenter',
//       city: 'Bathinda',
//       address: 'near bala ji sweets',
//       loanDetails: {
//         loanAmount: 5000,
//         interestRate: 20,
//         totalEmi: 100,
//         loanDate: '2025-12-01',
//         loanNumber: 'MG-2025-027',
//         loanType: 'Daily',
//         status: 'Active',
//         installmentFrequency: 'Daily',
//         tenure: 100,
//       }
//     },
//   ];

//   // --- 2. Iterate and Create ---
//   for (const data of customerData) {
    
//     // A. Calculate Financials
//     const calculated = calculateLoanData(
//       data.loanDetails.loanAmount,
//       data.loanDetails.interestRate,
//       data.loanDetails.totalEmi
//     );

//     console.log(`Creating customer: ${data.name}...`);

//     // B. Create Customer & Loan in Database
//     // Note: We check if customer exists first to avoid unique constraint errors on repeated runs
//     const existingCustomer = await prisma.customer.findUnique({
//         where: { aadharNo: data.aadharNo }
//     });

//     let loanIdToProcess = null;

//     if (!existingCustomer) {
//         const customer = await prisma.customer.create({
//             data: {
//               name: data.name,
//               fatherName: data.fatherName,
//               contactNo: data.contactNo,
//               aadharNo: data.aadharNo,
//               occupation: data.occupation,
//               city: data.city,
//               address: data.address,
//               loans: {
//                 create: [{
//                   loanNumber: data.loanDetails.loanNumber,
//                   loanDate: new Date(data.loanDetails.loanDate),
//                   loanType: data.loanDetails.loanType,
//                   status: data.loanDetails.status,
//                   installmentFrequency: data.loanDetails.installmentFrequency,
//                   tenure: data.loanDetails.tenure,
                  
//                   // Use Decimal values directly
//                   loanAmount: new Decimal(data.loanDetails.loanAmount),
//                   interestRate: new Decimal(data.loanDetails.interestRate),
//                   disbursedAmount: new Decimal(data.loanDetails.loanAmount), // Assuming full disbursement
                  
//                   interestAmount: calculated.interestAmount,
//                   totalAmount: calculated.totalAmount,
//                   emiAmount: calculated.emiAmount,
//                   balance: calculated.balance,
//                   totalEmi: calculated.totalEmi,
                  
//                   emiPaid: 0,
//                 }]
//               }
//             },
//             include: {
//               loans: {
//                 select: { id: true }
//               }
//             }
//         });
//         loanIdToProcess = customer.loans[0]?.id;
//     } else {
//         console.log(`   Customer ${data.name} already exists, skipping creation.`);
//     }

//     // C. Generate Installments using your Controller Logic
//     if (loanIdToProcess) {
//         console.log(`   Generating installments for Loan ID: ${loanIdToProcess}...`);
//         try {
//             await generateInstallmentsForLoan(loanIdToProcess);
//             console.log(`   ✅ Installments generated.`);
//         } catch (err) {
//             console.error(`   ❌ Error generating installments for ${data.name}:`, err.message);
//         }
//     }
//   }

//   console.log('✅ Seeding finished.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// seed.js
import PrismaClient from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient();

async function main() {
  const password = 'admin123'; // The password you want to use
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name: 'Ballu Singh',
      email: 'admin@mgfinance.com',
      password: hashedPassword,
    },
  });

  console.log('Admin user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });