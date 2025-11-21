import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const validateCustomerLoan = async (req, res, next) => {
  try {
    // 🔧 Parse loan and guarantor if sent as JSON strings (required for multipart/form-data)
    let loan = req.body.loan;
    let guarantor = req.body.guarantor;

    try {
      loan = typeof loan === "string" ? JSON.parse(loan) : loan;
      guarantor = typeof guarantor === "string" ? JSON.parse(guarantor) : guarantor;
    } catch (err) {
      console.error("JSON parsing error:", err.message);
      return res.status(400).json({ error: "Invalid JSON format in loan or guarantor" });
    }

    // ✅ Assign parsed objects back to req.body for downstream use
    req.body.loan = loan;
    req.body.guarantor = guarantor;

    const { name, fatherName, contactNo, aadharNo } = req.body;

    // 1. Required Fields
    if (!name || !fatherName || !contactNo || !aadharNo) {
      return res.status(400).json({ error: 'Missing required customer fields' });
    }

    // 2. Required Loan Fields
    if (!loan.loanNumber || !loan.loanAmount || !loan.loanDate) {
      console.error("Validation failed: Missing required loan fields", {
        loanNumber: loan.loanNumber,
        loanAmount: loan.loanAmount,
        loanDate: loan.loanDate,
      });
      return res.status(400).json({ error: 'Missing required loan fields' });
    }

    // 3. Format Checks
    const aadharRegex = /^\d{4}-\d{4}-\d{4}$/;
    const phoneRegex = /^\d{10}$/;

    console.log("Received body:", req.body); // 🧪 Debug: log full request body

    if (!aadharRegex.test(aadharNo)) {
      return res.status(400).json({ error: 'Invalid Aadhaar format (xxxx-xxxx-xxxx)' });
    }

    if (!phoneRegex.test(contactNo)) {
      return res.status(400).json({ error: 'Invalid contact number format (10 digits)' });
    }

    // 4. Duplicate Checks
    const [existingCustomer, existingLoan] = await Promise.all([
      prisma.customer.findUnique({ where: { aadharNo } }),
      prisma.loan.findUnique({ where: { loanNumber: loan.loanNumber } }),
    ]);

    if (existingCustomer) {
      return res.status(409).json({ error: 'Customer with this Aadhaar already exists' });
    }

    if (existingLoan) {
      return res.status(409).json({ error: 'Loan with this loan number already exists' });
    }

    // 5. Guarantor Validation
    if (guarantor) {
      if (!guarantor.name || !guarantor.phone || !guarantor.idProofNumber) {
        return res.status(400).json({ error: 'Missing required guarantor fields' });
      }

      const existingGuarantor = await prisma.guarantor.findUnique({
        where: { idProofNumber: guarantor.idProofNumber },
      });

      if (existingGuarantor) {
        return res.status(409).json({ error: 'Guarantor with this ID proof already exists' });
      }
    }

    next(); // ✅ All validations passed
  } catch (error) {
    console.error('Validation error:', error.message); 
    res.status(500).json({ error: 'Internal server error during validation' });
  }
};
