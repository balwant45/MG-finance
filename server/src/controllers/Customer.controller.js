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
// export const searchCustomers=async (req, res)=>{
//   try {
//     const {name, contactNo}=req.query;
//     if (!name && !contactNo) {
//     return res.status(400).json({error:'please provide name or contact number'})
//     }
//     const customers= await prisma.customer.findMany({
//       where:{
//         OR:[
//       name && {
//         name: {
//           contains: name,
//           mode: 'insensitive',
//         },
//       },
//       contactNo && {
//         contactNo: {
//           contains: contactNo,
//           mode: 'insensitive',
//         },
//       },
//     ].filter(Boolean),
//       }
//     });
//     res.json(customers);
//     console.log('Search query:', { name, contactNo });

//   } catch (error) {
//     console.error('error searching customers', error.message);
//     res.status(500).json({error:'internal server error'})
    
//   }
// }
// Ensure this function is used on your backend for the /customers/search route
export const searchCustomers = async (req, res) => {
  try {
    const { name, contactNo } = req.query; 
    const searchTerm = name || contactNo; // Use the value from the frontend's 'name' parameter

    if (!searchTerm) {
      return res.status(400).json({ error: 'A search term is required.' });
    }

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          // Search by name
          {
            name: {
              contains: searchTerm, 
              mode: 'insensitive',
            },
          },
          // Search by contact number
          {
            contactNo: {
              contains: searchTerm, 
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    
    // Returns an array, which is what the frontend expects.
    res.json(customers); 

  } catch (error) {
    console.error('Error searching customers:', error.message);
    res.status(500).json({ error: 'Internal server error occurred during search.' });
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

//full profile + loan summary
