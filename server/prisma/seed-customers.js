import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library'; // 1. FIXED: Imported Decimal

const prisma = new PrismaClient();

// --- 2. Helper: Date Calculator (Required for your logic) ---
function getNextDueDate(startDate, frequency, installmentNumber) {
    const date = new Date(startDate);
    const freq = frequency?.toLowerCase() || 'daily';
    
    if (freq === 'weekly') {
        date.setDate(date.getDate() + (7 * installmentNumber));
    } else {
        // Default to Daily
        date.setDate(date.getDate() + (1 * installmentNumber));
    }
    return date;
}

// --- 3. Your Controller Logic (Adapted for Seeding) ---
async function generateInstallmentsForLoan(loanId) {
    // A. Fetch Loan Data
    const loan = await prisma.loan.findUnique({ 
        where: { id: loanId },
        select: {
            loanAmount: true,
            interestRate: true,
            totalEmi: true,
            loanDate: true,
            loanType: true,
            installmentFrequency: true,
            totalAmount: true,
            emiAmount: true,
        }
    });

    if (!loan) return; // Exit if not found

    // B. Calculate Values
    const totalAmountToRepay = parseFloat(loan.totalAmount.toString());
    const emiAmountPerInstallment = parseFloat(loan.emiAmount.toString());
    const totalInstallments = loan.totalEmi;
    const loanDate = loan.loanDate;
    
    let remainingBalance = totalAmountToRepay;
    const installments = [];

    // C. Loop and Generate
    for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = getNextDueDate(loanDate, loan.installmentFrequency, i);
        
        const currentBalanceBeforePayment = remainingBalance;
        remainingBalance = remainingBalance - emiAmountPerInstallment;
        
        // Handle last installment rounding
        let finalBalance = (i === totalInstallments) ? 0 : remainingBalance;
        finalBalance = Math.max(0, finalBalance);

        installments.push({
            srNo: i,
            dueDate: dueDate,
            emiAmount: new Decimal(emiAmountPerInstallment.toFixed(2)),
            amount: new Decimal(0), // Not paid yet
            balance: new Decimal(finalBalance.toFixed(2)),
            status: "Pending",
            loanId: loanId
        });
    }

    // D. Insert to DB
    if (installments.length > 0) {
        await prisma.installment.createMany({ data: installments });
        
        // Update Loan with calculated End Date
        const endDate = installments[installments.length - 1].dueDate;
        await prisma.loan.update({
            where: { id: loanId },
            data: {
                endDate: endDate, 
                balance: new Decimal(totalAmountToRepay.toFixed(2)),
            }
        });
    }
}

// --- 4. Main Seeding Function ---
export async function seedCustomers() {
  console.log('🌱 Seeding Customers...');

  // Helper to calculate loan math before insertion
  const calculateLoanData = (loanAmount, interestRate, totalEmi) => {
    const principal = new Decimal(loanAmount);
    const rate = new Decimal(interestRate);
    const totalEmiNum = totalEmi;
    const oneHundred = new Decimal(100);

    const interestAmount = principal.mul(rate).div(oneHundred);
    const totalAmount = principal.add(interestAmount);
    
    let emiAmount = new Decimal(0);
    if (totalEmiNum > 0) {
      const totalEmiDecimal = new Decimal(totalEmiNum);
      emiAmount = totalAmount.div(totalEmiDecimal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    }

    return { 
        interestAmount, 
        totalAmount, 
        emiAmount, 
        balance: totalAmount, 
        totalEmi: totalEmiNum 
    };
  };

  // --- YOUR SPECIFIC DATA ---
  const customerData = [
    {
      name: 'Harmandeep singh',
      fatherName: 'Harpal singh',
      contactNo: '6280139908',
      aadharNo: '1111-2222-3333',
      occupation: 'Electrician',
      city: 'Amritsar',
      address: 'Near Golden Temple',
      loanDetails: {
        loanAmount: 30000,
        interestRate: 26.6,
        totalEmi: 20,
        loanDate: '2025-12-04',
        loanNumber: 'MG-2025-029',
        loanType: 'weekly',
        status: 'Active',
        installmentFrequency: 'Weekly',
        tenure: 100,
      }
    },
    {
      name: 'Buta singh',
      fatherName: 'Kartar singh',
      contactNo: '9872922934',
      aadharNo: '9661-8664-0247',
      occupation: 'Carpenter',
      city: 'Bathinda',
      address: 'Near Bus Stand street no. 3',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 20,
        totalEmi: 20,
        loanDate: '2025-12-05',
        loanNumber: 'MG-2025-030',
        loanType: 'weekly',
        status: 'Active',
        installmentFrequency: 'Weekly',
        tenure: 100,
      }
    },
    {
      name: 'Davinder Singh',
      fatherName: 'Hardev Singh',
      contactNo: '9815423703',
      aadharNo: '3333-2222-7536',
      occupation: 'Carpenter',
      city: 'Bathinda',
      address: 'near bala ji sweets',
      loanDetails: {
        loanAmount: 5000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-12-01',
        loanNumber: 'MG-2025-027',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
    },
  ];

  // --- 5. Iterate and Create ---
  for (const data of customerData) {
    console.log(`Creating customer: ${data.name}...`);
    
    // A. Calculate Financials
    const calculated = calculateLoanData(
      data.loanDetails.loanAmount,
      data.loanDetails.interestRate,
      data.loanDetails.totalEmi
    );

    // B. Check Exists
    const existingCustomer = await prisma.customer.findUnique({
        where: { aadharNo: data.aadharNo }
    });

    let loanIdToProcess = null;

    if (!existingCustomer) {
        // C. Create Customer + Loan
        const customer = await prisma.customer.create({
            data: {
              name: data.name,
              fatherName: data.fatherName,
              contactNo: data.contactNo,
              aadharNo: data.aadharNo,
              occupation: data.occupation,
              city: data.city,
              address: data.address,
              loans: {
                create: [{
                  loanNumber: data.loanDetails.loanNumber,
                  loanDate: new Date(data.loanDetails.loanDate),
                  loanType: data.loanDetails.loanType,
                  status: data.loanDetails.status,
                  installmentFrequency: data.loanDetails.installmentFrequency,
                  tenure: data.loanDetails.tenure,
                  
                  loanAmount: new Decimal(data.loanDetails.loanAmount),
                  interestRate: new Decimal(data.loanDetails.interestRate),
                  disbursedAmount: new Decimal(data.loanDetails.loanAmount),
                  
                  interestAmount: calculated.interestAmount,
                  totalAmount: calculated.totalAmount,
                  emiAmount: calculated.emiAmount,
                  balance: calculated.balance,
                  totalEmi: calculated.totalEmi,
                  
                  emiPaid: 0,
                }]
              }
            },
            include: { loans: { select: { id: true } } }
        });
        loanIdToProcess = customer.loans[0]?.id;
    } else {
        console.log(`   Customer ${data.name} already exists. Skipping.`);
    }

    // D. Generate Installments
    if (loanIdToProcess) {
        console.log(`   Generating installments for Loan ID: ${loanIdToProcess}...`);
        try {
            await generateInstallmentsForLoan(loanIdToProcess);
            console.log(`   ✅ Installments generated.`);
        } catch (err) {
            console.error(`   ❌ Error generating installments for ${data.name}:`, err.message);
        }
    }
  }

  console.log('✅ Customer Seeding finished.');
}