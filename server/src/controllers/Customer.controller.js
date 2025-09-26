import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();




// customer creation
import { uploadOnCloudinary } from '../utils/cloudinary.js';


export const createCustomer = async (req, res) => {
  try {
    console.log('req.body:', req.body); // Debug
    console.log('req.file:', req.file); // Debug

    const {
      name,
      fatherName,
      contactNo,
      altContactNo,
      aadharNo,
      srNo,
      occupation,
      city,
    } = req.body;

    const localImagePath = req.file?.path;
      //  Upload to Cloudinary
    const cloudinaryResult = await uploadOnCloudinary(localImagePath);
    const imageUrl = cloudinaryResult?.secure_url;

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        fatherName,
        contactNo,
        altContactNo,
        aadharNo,
        srNo,
        occupation,
        city,
        profileImageUrl: imageUrl,
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error.message);
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

// update customer 

// export const updateCustomerFinance= async ()=>{
//   try {
//     const customerId=parseInt(req.params.id);
//     if(isNaN(customerId)) return res.status(400).json({error:'invalid User'});

    
//   } catch (error) {
    
//   }
// }
// customer search by name/number
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
// update EMI loan summary
// view all loans for a customer
//full profile + loan summary