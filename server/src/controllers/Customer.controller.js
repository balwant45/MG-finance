import { generateInstallmentsForLoan } from "./Installment.controllers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {  Prisma } from "@prisma/client";
import { prisma } from "../db/pisma.js";


export const createCustomer = async (req, res) => {
  try {
    // --- 1. DATA NORMALIZATION ---
    // Handle multipart/form-data: Parse stringified JSON from frontend if necessary
    const rawLoan = typeof req.body.loan === 'string' ? JSON.parse(req.body.loan) : req.body.loan;
    const rawGuarantor = typeof req.body.guarantor === 'string' ? JSON.parse(req.body.guarantor) : req.body.guarantor;

    // Destructure primary customer details directly from req.body
    const { name, fatherName, contactNo, altContactNo, aadharNo, occupation, city, address } = req.body;

    // --- 2. INPUT SANITIZATION ---
    const principal = new Prisma.Decimal(rawLoan.loanAmount || 0);
    const tenureDays = parseInt(rawLoan.tenure, 10) || 0;
    const frequency = rawLoan.installmentFrequency;

    // --- 3. BUSINESS LOGIC: EMI COUNT CALCULATION ---
    // Derives the number of installments based on tenure and the specific day-gaps
    let totalEmi = 0;
    if (tenureDays > 0) {
        if (frequency === 'Daily') totalEmi = tenureDays;                // 1 payment/day
        else if (frequency === 'Weekly') totalEmi = Math.floor(tenureDays / 5);   // 1 payment/5 days
        else if (frequency === 'Monthly 10') totalEmi = Math.floor(tenureDays / 10); // 1 payment/10 days
        else totalEmi = parseInt(rawLoan.totalEmi, 10) || 0;             // Fallback to manual count
    }

    // --- 4. DATE LOGIC: END DATE GENERATION ---
    // Automatically calculates the loan expiry date by adding tenure days to start date
    const startDate = new Date(rawLoan.loanDate);
    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setDate(startDate.getDate() + tenureDays);

    // --- 5. FINANCIAL CALCULATIONS ---
    const interestRate = new Prisma.Decimal(rawLoan.interestRate || 0);
    // Interest = Principal * (Rate / 100)
    const interestAmount = principal.mul(interestRate).div(100);
    // Total Payable = Principal + Calculated Interest
    const totalAmount = principal.add(interestAmount);

    // Calculate individual EMI amount: Total / Number of payments
    let emiAmount = new Prisma.Decimal(0);
    if (totalEmi > 0) {
        emiAmount = totalAmount.div(new Prisma.Decimal(totalEmi))
                               .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    }

    // --- 6. LOAN DATA OBJECT PREPARATION ---
    // Consolidates calculated values for Prisma database insertion
    const loanData = {
        loanNumber: rawLoan.loanNumber,
        loanDate: startDate,
        endDate: calculatedEndDate,     // Derived end date
        loanType: rawLoan.loanType,
        status: rawLoan.status || "Active",
        installmentFrequency: frequency,
        loanAmount: principal,
        interestRate: interestRate,
        totalEmi: totalEmi,             // Derived EMI count
        interestAmount: interestAmount,
        totalAmount: totalAmount,
        emiAmount: emiAmount,           // Derived EMI value
        balance: totalAmount,           // Initial balance equals total payable
        tenure: tenureDays,
        disbursedAmount: rawLoan.disbursedAmount ? new Prisma.Decimal(rawLoan.disbursedAmount) : undefined,
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
    const newCustomer = await prisma.customer.create({
      data: {
        name, fatherName, contactNo, altContactNo, aadharNo, occupation, city, address,
        // srNo, // Uncomment if srNo is a field in your Customer model
        profileImageUrl: imageUrl,
        loans: {
          create: [
            {
              ...loanData, 
              ...loanGuarantorData, 
            },
          ],
        },
      },
      include: {
        loans: {
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
        tenure: `${loan.tenure} days`,
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

        // 🎯 Process all loans instead of just one
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
                    loanNumber:loan.loanNumber || 'N/A'
                },
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
            allLoans: loansData // 🎯 Array sent to frontend
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//adding loan for existing customer
export const addLoanToCustomer = async (req, res) => {
    const customerId = parseInt(req.params.id);
    const { loan, guarantor } = req.body;

    if (isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid customer ID" });
    }

    // --- 1. Business Logic Calculations ---
    const tenureDays = parseInt(loan.tenure, 10) || 0;
    const freq = loan.installmentFrequency;
    
    // Calculate Correct EMI Count
    let derivedTotalEmi = 0;
    if (tenureDays > 0) {
        if (freq === 'Daily') derivedTotalEmi = tenureDays;
        else if (freq === 'Weekly') derivedTotalEmi = Math.floor(tenureDays / 5);
        else if (freq === 'Monthly 10') derivedTotalEmi = Math.floor(tenureDays / 10);
        else derivedTotalEmi = parseInt(loan.totalEmi, 10) || 0;
    }

    // Calculate Correct End Date
    const startDate = new Date(loan.loanDate);
    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setDate(startDate.getDate() + tenureDays);

    try {
        const newLoan = await prisma.loan.create({
            data: {
                loanNumber: loan.loanNumber,
                loanDate: startDate,
                endDate: calculatedEndDate, // 🎯 FIX: Use the calculated end date
                loanType: loan.loanType,
                status: loan.status || "Active",
                installmentFrequency: freq,
                
                loanAmount: new Prisma.Decimal(loan.loanAmount || 0),
                interestRate: new Prisma.Decimal(loan.interestRate || 0),
                
                // 🎯 FIX: Use derivedTotalEmi instead of raw loan.totalEmi
                totalEmi: derivedTotalEmi, 
                tenure: tenureDays,
                
                interestAmount: new Prisma.Decimal(loan.interestAmount || 0),
                totalAmount: new Prisma.Decimal(loan.totalAmount || 0),
                emiAmount: new Prisma.Decimal(loan.emiAmount || 0),
                balance: new Prisma.Decimal(loan.totalAmount || 0), 

                customerId: customerId,

                guarantors: guarantor && guarantor.name ? {
                    create: [{
                        role: "Primary",
                        guarantor: {
                            create: {
                                name: guarantor.name,
                                phone: guarantor.phone,
                                address: guarantor.address,
                                city: guarantor.city,
                                relationToBorrower: guarantor.relationToBorrower,
                                occupation: guarantor.occupation,
                                idProofType: guarantor.idProofType,
                                idProofNumber: guarantor.idProofNumber,
                                notes: guarantor.notes,
                            }
                        }
                    }]
                } : undefined
            }
        });

        // ⚙️ Generate installments using the new database record
        await generateInstallmentsForLoan(newLoan.id);

        console.log(`Loan ${newLoan.loanNumber} added to existing Customer ${customerId}`);
        res.status(201).json(newLoan);

    } catch (error) {
        console.error("LOGGING ERROR:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
//full profile + loan summary
