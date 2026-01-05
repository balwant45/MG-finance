import { generateInstallmentsForLoan } from "./Installment.controllers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {  Prisma } from "@prisma/client";
import { prisma } from "../db/pisma.js";


export const createCustomer = async (req, res) => {
  try {
    // --- 1. Data Parsing ---
    // Ensure all data is parsed correctly from FormData strings
    const rawLoan = typeof req.body.loan === 'string' ? JSON.parse(req.body.loan) : req.body.loan;
    const rawGuarantor = typeof req.body.guarantor === 'string' ? JSON.parse(req.body.guarantor) : req.body.guarantor;

    const {
      name, fatherName, contactNo, altContactNo, aadharNo, srNo, occupation, city, address,
    } = req.body;

    // 1. Get and sanitize key inputs
    const principal = new Prisma.Decimal(rawLoan.loanAmount);
    // totalEmi is used for the divisor and the loop count in the Installment controller
    const totalEmi = rawLoan.totalEmi ? parseInt(rawLoan.totalEmi, 10) : 0; 
    // Interest Rate is required for calculation
    const interestRatePercentage = rawLoan.interestRate ? new Prisma.Decimal(rawLoan.interestRate) : new Prisma.Decimal(0);

    const oneHundred = new Prisma.Decimal(100);

    // 2. Calculate Total Interest Amount: Principal * (Rate / 100)
    const calculatedInterestAmount = principal.mul(interestRatePercentage).div(oneHundred);

    // 3. Calculate Total Payable Amount: Principal + Interest
    const calculatedTotalAmount = principal.add(calculatedInterestAmount); 

    // 4. Calculate EMI Amount: Total Amount / Total EMIs
    let calculatedEmiAmount = new Prisma.Decimal(0);

    if (totalEmi > 0) {
        const totalEmiDecimal = new Prisma.Decimal(totalEmi);
        calculatedEmiAmount = calculatedTotalAmount.div(totalEmiDecimal);
        // Round to 2 decimal places for financial accuracy
        calculatedEmiAmount = calculatedEmiAmount.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    }
    
    // --- 3. Final Loan Data Object ---
    const loanData = {
      loanNumber: rawLoan.loanNumber,
      loanDate: new Date(rawLoan.loanDate),
      loanType: rawLoan.loanType,
      status: rawLoan.status,
      installmentFrequency: rawLoan.installmentFrequency,
      
      // MANDATORY Fields (Calculated/Sanitized)
      loanAmount: principal,
      interestRate: interestRatePercentage,
      totalEmi: totalEmi,
      interestAmount: calculatedInterestAmount,
      totalAmount: calculatedTotalAmount,
      emiAmount: calculatedEmiAmount,
      balance: calculatedTotalAmount, // Initial balance

      // Optional Fields (Sanitized)
      tenure: rawLoan.tenure ? parseInt(rawLoan.tenure, 10) : undefined,
      disbursedAmount: rawLoan.disbursedAmount 
            ? new Prisma.Decimal(rawLoan.disbursedAmount) 
            : undefined,
    };
    
    // --- 4. Image Upload ---
    const localImagePath = req.file?.path;
    const cloudinaryResult = await uploadOnCloudinary(localImagePath);
    const imageUrl = cloudinaryResult?.secure_url;

    // --- 5. Guarantor Data Preparation ---
    let loanGuarantorData = {};
    if (rawGuarantor && rawGuarantor.name) {
      loanGuarantorData = {
        guarantors: {
          create: [{
            role: "Primary",
            guarantor: {
              create: {
                name: rawGuarantor.name,
                relationToBorrower: rawGuarantor.relationToBorrower,
                phone: rawGuarantor.phone,
                address: rawGuarantor.address,
                city: rawGuarantor.city,
                occupation: rawGuarantor.occupation,
                idProofType: rawGuarantor.idProofType,
                idProofNumber: rawGuarantor.idProofNumber,
                notes: rawGuarantor.notes,
              },
            },
          }],
        },
      };
    }
    
    // --- 6. Create Customer with Nested Writes ---
   // --- 6. Upsert Customer (Handle Existing or New) ---
const newCustomer = await prisma.customer.upsert({
  where: { aadharNo: aadharNo }, // Checks if this Aadhar already exists
  update: {
    // If they exist, update their info (optional)
    occupation,
    city,
    address,
    profileImageUrl: imageUrl || undefined,
    loans: {
      create: [{
        ...loanData,
        ...loanGuarantorData,
      }],
    },
  },
  create: {
    // If they don't exist, create a new record
    name, fatherName, contactNo, altContactNo, aadharNo, occupation, city, address,
    profileImageUrl: imageUrl,
    loans: {
      create: [{
        ...loanData,
        ...loanGuarantorData,
      }],
    },
  },
  include: {
    loans: {
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true }
    }
  }
});
    
    // --- 7. Generate Installments ---
    const newLoanId = newCustomer.loans[0]?.id;

    if (newLoanId) {
        await generateInstallmentsForLoan(newLoanId);
        console.log(`Installments generated for new loan ID: ${newLoanId}`);
    } else {
        console.warn('Loan ID was not returned after creation. Installments skipped.');
    }

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("CRITICAL Error creating customer with loan:", error.stack); 
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};               
// find by id
export const getCustomerById = async (req, res) => {
  const customerId = parseInt(req.params.id);

  if (isNaN(customerId)) {
    return res.status(400).json({ error: "Invalid customer ID" });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
//search by name and number

// Fetch all loan data for a specific customer, consolidated for the frontend
export const getCustomerLoans = async (req, res) => {
  const customerId = parseInt(req.params.id);
  if (isNaN(customerId))
    return res.status(400).json({ error: "Invalid customer ID" });

  try {
    // 1. Find the latest loan for the customer
    const loan = await prisma.loan.findFirst({
      where: { customerId },
      orderBy: { startDate: "desc" }, 
      include: {
        installments: true,
        transactions: {
          orderBy: { date: "desc" }, // Get recent transactions
          take: 5, // Limit to 5 recent transactions
        },
      },
    });

    if (!loan) {
      // Return empty data structure if no loan is found, preventing a frontend crash
      return res.json({
        loanSummary: {},
        transactions: [],
        emiLedger: [],
      });
    } // 2. Perform Loan Calculations (similar to your getLoanSummary)

    const totalPaid =
      loan.installments?.reduce(
        (sum, inst) => sum + parseFloat(inst.amount),
        0
      ) || 0;
    const totalAmount = parseFloat(loan.totalAmount) || 0;
    const remainingBalance = totalAmount - totalPaid; // 3. Format the Consolidated Response (as the frontend expects)

    res.json({
      loanSummary: {
        id: loan.id,
        startDate: loan.startDate
          ? loan.startDate.toISOString().split("T")[0]
          : "N/A",
        closingDate: loan.endDate
          ? loan.endDate.toISOString().split("T")[0]
          : "N/A", // Assuming you have an endDate
        amount: loan.totalAmount, // or loan.principalAmount, depending on your schema
        balance: remainingBalance.toFixed(2), // Use calculated balance
        type: loan.loanType,
        status: loan.status,
        tenure: `${loan.totalEmi} days`,
      },
      transactions:
        loan.transactions.map((t) => ({
          date: t.date.toISOString().split("T")[0],
          amount: t.amount.toString(),
        })) || [],
      emiLedger:
        loan.installments.map((i) => ({
          slNo: i.id,
          date: i.date.toISOString().split("T")[0],
          emiAmount: i.amount.toString(),
          debit: i.paymentAmount.toString(), // Assuming this is how you track payments
          balance: i.remainingBalance.toString(), // Assuming this is tracked
        })) || [], // installments are being used as the ledger
    });
  } catch (error) {
    console.error("Error fetching consolidated customer loans:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Ensure this function is used on your backend for the /customers/search route
export const searchCustomers = async (req, res) => {
  try {
    const { name, contactNo } = req.query;
    const searchTerm = name || contactNo; // Use the value from the frontend's 'name' parameter

    if (!searchTerm) {
      return res.status(400).json({ error: "A search term is required." });
    }

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          // Search by name
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          // Search by contact number
          {
            contactNo: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    // Returns an array, which is what the frontend expects.
    res.json(customers);
  } catch (error) {
    console.error("Error searching customers:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error occurred during search." });
  }
};

export const getCustomerProfile = async (req, res) => {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid ID' });

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                loans: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        guarantors: { where: { role: 'Primary' }, include: { guarantor: true } },
                        installments: { orderBy: { dueDate: 'asc' } },
                        transactions: { orderBy: { date: 'desc' }, take: 5 },
                    },
                },
            },
        });

        if (!customer) return res.status(404).json({ error: 'Customer not found.' });

        // Map all loans into the structure expected by the frontend
        const loansData = customer.loans.map(loan => {
            const totalAmount = parseFloat(loan.totalAmount?.toString() || '0');
            const balanceAmount = parseFloat(loan.balance?.toString() || totalAmount);
            const lastInst = loan.installments[loan.installments.length - 1];
            
            return {
                loanSummary: {
                    id: loan.id,
                    startDate: loan.loanDate ? loan.loanDate.toISOString().split('T')[0] : 'N/A',
                    closingDate: lastInst?.dueDate ? lastInst.dueDate.toISOString().split('T')[0] : 'N/A',
                    amount: loan.loanAmount?.toString() || '0.00',
                    closingBalance: balanceAmount.toFixed(2),
                    type: loan.loanType || 'N/A',
                    status: loan.status || 'N/A',
                    tenure: `${loan.tenure || 'N/A'} days`,
                    installmentAmount: loan.emiAmount?.toString() || '0.00',
                },
                recentTransactions: loan.transactions.map(t => ({
                    date: t.date.toISOString().split('T')[0],
                    amount: t.amount?.toString() || '0.00',
                })),
                emiLedger: loan.installments.map(i => ({
                    slNo: i.srNo,
                    date: i.dueDate.toISOString().split('T')[0],
                    emiAmount: i.emiAmount?.toString() || '0.00',
                    debit: i.amount?.toString() || '0.00',
                    balance: i.balance?.toString() || '0.00',
                })),
                guarantor: loan.guarantors[0]?.guarantor?.name || 'N/A'
            };
        });

        res.json({
            id: customer.id,
            name: customer.name,
            fatherName: customer.fatherName,
            contactNo: customer.contactNo || 'N/A',
            alternateNo: customer.altContactNo || 'N/A',
            aadharNo: customer.aadharNo || 'N/A',
            occupation: customer.occupation || 'N/A',
            address: customer.address || 'N/A',
            profileImageUrl: customer.profileImageUrl,
            allLoans: loansData // 🎯 Send all loans instead of just one
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//adding loan for existing customer
export const addLoanToCustomer = async (req, res) => {
  const customerId = parseInt(req.params.id);
  if (isNaN(customerId))
    return res.status(400).json({ error: "Invalid customer ID" });

  try {
    const { loan, guarantor } = req.body;

    const newLoan = await prisma.loan.create({
      data: {
        customerId,
        loanNumber: loan.loanNumber,
        loanDate: new Date(loan.loanDate),
        loanType: loan.loanType,
        status: loan.status,
        loanAmount: new Prisma.Decimal(loan.loanAmount),
        disbursedAmount: loan.disbursedAmount
          ? new Prisma.Decimal(loan.disbursedAmount)
          : undefined,
        interestRate: loan.interestRate
          ? new Prisma.Decimal(loan.interestRate)
          : undefined,
        interestAmount: loan.interestAmount
          ? new Prisma.Decimal(loan.interestAmount)
          : undefined,
        totalAmount: loan.totalAmount
          ? new Prisma.Decimal(loan.totalAmount)
          : undefined,
        emiAmount: loan.emiAmount
          ? new Prisma.Decimal(loan.emiAmount)
          : undefined,
        totalEmi: loan.totalEmi,
        tenure: loan.tenure,
        installmentFrequency: loan.installmentFrequency,
        guarantors: guarantor
          ? {
              create: [
                {
                  guarantor: {
                    create: guarantor,
                  },
                  role: "Primary",
                },
              ],
            }
          : undefined,
      },
    });
    // ✅ CHANGE: Call the installment generator using the ID of the newly created loan
    await generateInstallmentsForLoan(newLoan.id);
    console.log(`Installments generated for new loan ID: ${newLoan.id}`);

    res.status(201).json(newLoan);
  } catch (error) {
    console.error("Error adding loan:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

    

//full profile + loan summary
