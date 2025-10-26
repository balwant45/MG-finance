import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();
// customer creation
import { uploadOnCloudinary } from '../utils/cloudinary.js';


export const createCustomer = async (req, res) => {
  try {
    // const loan = typeof req.body.loan === 'string' ? JSON.parse(req.body.loan) : req.body.loan;
// const guarantor = typeof req.body.guarantor === 'string' ? JSON.parse(req.body.guarantor) : req.body.guarantor;

    const {
      name,
      fatherName,
      contactNo,
      altContactNo,
      aadharNo,
      srNo,
      occupation,
      city,
      address,
      loan, 
      guarantor
    } = req.body;

    // Upload image to Cloudinary
    const localImagePath = req.file?.path;
    const cloudinaryResult = await uploadOnCloudinary(localImagePath);
    const imageUrl = cloudinaryResult?.secure_url;

    // Prepare guarantor data if provided
    let guarantorData = undefined;
    if (guarantor) {
      guarantorData = {
        guarantors: {
          create: [
            {
              guarantor: {
                create: {
                  name: guarantor.name,
                  relationToBorrower: guarantor.relationToBorrower,
                  phone: guarantor.phone,
                  address: guarantor.address,
                  city: guarantor.city,
                  occupation: guarantor.occupation,
                  idProofType: guarantor.idProofType,
                  idProofNumber: guarantor.idProofNumber,
                  notes: guarantor.notes,
                },
              },
              role: 'Primary',
            },
          ],
        },
      };
    }

    // Create customer with nested loan and optional guarantor
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        fatherName,
        contactNo,
        altContactNo,
        aadharNo,
        
        occupation,
        city,
        address,
        profileImageUrl: imageUrl,
        loans: {
          create: [
            {
              loanNumber: loan.loanNumber,
              loanDate: new Date(loan.loanDate),
              loanType: loan.loanType,
              status: loan.status,
              loanAmount: new Prisma.Decimal(loan.loanAmount),
              disbursedAmount: loan.disbursedAmount ? new Prisma.Decimal(loan.disbursedAmount) : undefined,
              interestRate: loan.interestRate ? new Prisma.Decimal(loan.interestRate) : undefined,
              interestAmount: loan.interestAmount ? new Prisma.Decimal(loan.interestAmount) : undefined,
              totalAmount: loan.totalAmount ? new Prisma.Decimal(loan.totalAmount) : undefined,
              emiAmount: loan.emiAmount ? new Prisma.Decimal(loan.emiAmount) : undefined,
              totalEmi: loan.totalEmi,
              tenure: loan.tenure,
              installmentFrequency: loan.installmentFrequency,
              ...guarantorData,
            },
          ],
        },
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer with loan:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// find by id 
export const getCustomerById = async (req, res) => {
  const customerId = parseInt(req.params.id);

  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//search by name and number
export const searchCustomers=async (req, res)=>{
  try {
    const {name, contactNo}=req.query;
    if (!name && !contactNo) {
    return res.status(400).json({error:'please provide name or contact number'})
    }
    const customers= await prisma.customer.findMany({
      where:{
        OR:[
      name && {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      contactNo && {
        contactNo: {
          contains: contactNo,
          mode: 'insensitive',
        },
      },
    ].filter(Boolean),
      }
    });
    res.json(customers);
    console.log('Search query:', { name, contactNo });

  } catch (error) {
    console.error('error searching customers', error.message);
    res.status(500).json({error:'internal server error'})
    
  }
}
// view all loans for a customer
export const getCustomerProfile = async (req, res) => {
  const customerId = parseInt(req.params.id);
  if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid customer ID' });

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        loans: {
          include: {
            guarantors: {
              include: { guarantor: true }
            },
            installments: true,
            transactions: true
          }
        }
      }
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//adding loan for existing customer
export const addLoanToCustomer = async (req, res) => {
  const customerId = parseInt(req.params.id);
  if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid customer ID' });

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
        disbursedAmount: loan.disbursedAmount ? new Prisma.Decimal(loan.disbursedAmount) : undefined,
        interestRate: loan.interestRate ? new Prisma.Decimal(loan.interestRate) : undefined,
        interestAmount: loan.interestAmount ? new Prisma.Decimal(loan.interestAmount) : undefined,
        totalAmount: loan.totalAmount ? new Prisma.Decimal(loan.totalAmount) : undefined,
        emiAmount: loan.emiAmount ? new Prisma.Decimal(loan.emiAmount) : undefined,
        totalEmi: loan.totalEmi,
        tenure: loan.tenure,
        installmentFrequency: loan.installmentFrequency,
        guarantors: guarantor ? {
          create: [
            {
              guarantor: {
                create: guarantor
              },
              role: 'Primary'
            }
          ]
        } : undefined
      }
    });

    res.status(201).json(newLoan);
  } catch (error) {
    console.error('Error adding loan:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//create installments from loan data
export const generateInstallmentsForLoan = async (loanId) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error("Loan not found");

  const installments = [];
  let balance = parseFloat(loan.totalAmount);

  for (let i = 1; i <= loan.totalEmi; i++) {
    const emiAmount = parseFloat(loan.emiAmount);
    const dueDate = new Date(loan.loanDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    installments.push({
      srNo: i,
      dueDate,
      emiAmount,
      amount: 0,
      balance: balance - emiAmount,
      status: "Pending",
      loanId: loanId
    });

    balance -= emiAmount;
  }

  await prisma.installment.createMany({ data: installments });
};

// Return all EMI payments for a loan.
export const getLoanInstallments = async (req, res) => {
  const loanId = parseInt(req.params.id);
  if (isNaN(loanId)) return res.status(400).json({ error: 'Invalid loan ID' });

  try {
    const installments = await prisma.installment.findMany({
      where: { loanId },
      orderBy: { srNo: 'asc' }
    });

    res.json(installments);
  } catch (error) {
    console.error('Error fetching installments:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


//full profile + loan summary
