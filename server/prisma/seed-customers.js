import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// --- 2. Helper: Date Calculator ---
function getNextDueDate(startDate, frequency, installmentNumber) {
    const date = new Date(startDate);
    const freq = frequency?.toLowerCase() || 'daily';
    
    if (freq.includes('weekly')) {
        date.setDate(date.getDate() + (7 * installmentNumber));
    } else if (freq.includes('5 days')) {
        date.setDate(date.getDate() + (5 * installmentNumber));
    } else {
        // Default to Daily
        date.setDate(date.getDate() + (1 * installmentNumber));
    }
    return date;
}

// --- 3. Controller Logic for Installments ---
async function generateInstallmentsForLoan(loanId) {
    const loan = await prisma.loan.findUnique({ 
        where: { id: loanId },
        select: {
            loanAmount: true,
            totalEmi: true,
            loanDate: true,
            installmentFrequency: true,
            totalAmount: true,
            emiAmount: true,
        }
    });

    if (!loan) return;

    const totalAmountToRepay = parseFloat(loan.totalAmount.toString());
    const emiAmountPerInstallment = parseFloat(loan.emiAmount.toString());
    const totalInstallments = loan.totalEmi;
    
    let remainingBalance = totalAmountToRepay;
    const installments = [];

    for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = getNextDueDate(loan.loanDate, loan.installmentFrequency, i);
        
        remainingBalance = remainingBalance - emiAmountPerInstallment;
        
        // Handle rounding and ensure balance doesn't go negative
        let finalBalance = (i === totalInstallments) ? 0 : remainingBalance;
        finalBalance = Math.max(0, finalBalance);

        installments.push({
            srNo: i,
            dueDate: dueDate,
            emiAmount: new Decimal(emiAmountPerInstallment.toFixed(2)),
            amount: new Decimal(0),
            balance: new Decimal(finalBalance.toFixed(2)),
            status: "Pending",
            loanId: loanId
        });
    }

    if (installments.length > 0) {
        await prisma.installment.createMany({ data: installments });
        
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
  console.log('🌱 Seeding Customers and Loans...');

  const calculateLoanData = (loanAmount, interestRate, totalEmi) => {
    const principal = new Decimal(loanAmount);
    const rate = new Decimal(interestRate);
    const totalEmiNum = totalEmi;

    const interestAmount = principal.mul(rate).div(100);
    const totalAmount = principal.add(interestAmount);
    
    let emiAmount = new Decimal(0);
    if (totalEmiNum > 0) {
      emiAmount = totalAmount.div(new Decimal(totalEmiNum)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    }

    return { interestAmount, totalAmount, emiAmount, balance: totalAmount, totalEmi: totalEmiNum };
  };

   const customerData = [
   {name: 'Jasvir Singh',
      fatherName: 'Ajmer Singh',
      contactNo: '',
      aadharNo: '7632-1187-3217',
      occupation: 'Carpenter',
      city: 'Bathinda',
      address: 'Kot samir',
      loanDetails: {
        loanAmount: 15000,
        interestRate: 20,
        totalEmi: 10,
        loanDate: '2025/08/04',
        loanNumber: 'MG-2025-01',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'weekly',
        tenure: 100,
      }
},
{name: 'Amandeep Singh',
      fatherName: 'Gurmail Singh',
      contactNo: '783756252',
      aadharNo: '5822-9347-1059',
      occupation: 'toys shop',
      city: 'Bathinda',
      address: 'vill. Talwandi sabo',
      loanDetails: {
        loanAmount:20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-12-08',
        loanNumber: 'MG-2025-02',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Sandeep Singh',
      fatherName: 'Avtar Singh',
      contactNo: '70872-09008',
      aadharNo: '2539-6683-8202',
      occupation: 'Coffe shop',
      city: 'Bathinda',
      address: 'Vill. Gadhiana wala sekhpura',
      loanDetails: {
        loanAmount: 15000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-08-13',
        loanNumber: 'MG-2025-03',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Gurpreet Singh',
      fatherName: 'Mishra Singh',
      contactNo: '78140-20289',
      aadharNo: '4661-0253-2530',
      occupation: 'Juice shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 15000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-08-14',
        loanNumber: 'MG-2025-04',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Malkit Singh',
      fatherName: 'Buta Singh',
      contactNo: '84277-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-08-18',
        loanNumber: 'MG-2025-05',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Angrej Singh',
      fatherName: 'Niranjan Singh',
      contactNo: '75089-31665',
      aadharNo: '6198-5370-2872',
      occupation: 'Vegetable shop',
      city: 'Bathinda',
      address: 'near post office talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-08-29',
        loanNumber: 'MG-2025-06',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Malkit Singh',
      fatherName: 'Buta Singh',
      contactNo: '84277-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 10000,
        interestRate: 100,
        totalEmi: 12,
        loanDate: '2025-09-02',
        loanNumber: 'MG-2025-07',
        loanType: 'Short',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 12,
      }
},
{name: 'Jaspreet kaur',
      fatherName: 'w/o Jarnail Singh',
      contactNo: '7814999168',
      aadharNo: '3764-2717-0976',
      occupation: 'Stiching',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-09-08',
        loanNumber: 'MG-2025-08',
        loanType: 'Daily',
        status: 'Defulter',
        installmentFrequency: 'weekly',
        tenure: 100,
      }
},
{name: 'Sandeep Kaur',
      fatherName: 'w/o Baljit Singh',
      contactNo: '78140-39944',
      aadharNo: '2396-0167-1659',
      occupation: 'Kreyana shop',
      city: 'Mansa',
      address: 'Vill-Ghurkani,the.sardulgarh,Distt. Mansa',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-09-10',
        loanNumber: 'MG-2025-09',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Malkit Singh',
      fatherName: 'Buta Singh',
      contactNo: '84277-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 50000,
        interestRate: 100,
        totalEmi: 34,
        loanDate: '2025-09-18',
        loanNumber: 'MG-2025-10',
        loanType: 'short',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 34,
      }
},
{name: 'Malkit Singh',
      fatherName: 'Buta Singh',
      contactNo: '84277-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 25000,
        interestRate: 100,
        totalEmi: 11,
        loanDate: '2025-10-22',
        loanNumber: 'MG-2025-43',
        loanType: 'Short',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 11,
      }
},
{name: 'Malkit Singh',
      fatherName: 'Buta Singh',
      contactNo: '84277-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount:15000,
        interestRate: 100,
        totalEmi: 30,
        loanDate: '2025-11-04',
        loanNumber: 'MG-2025-44',
        loanType: 'Short',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 30,
      }
},
{name: 'Malkit Singh',
      fatherName: 'Buta Singh',
      contactNo: '8427710305',
      aadharNo: '7559-7182-1625',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 10000,
        interestRate: 100,
        totalEmi: 18,
        loanDate: '2025-12-04',
        loanNumber: 'MG-2025-45',
        loanType: 'Short',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 18,
      }
},
{name: 'Gurpreet Singh',
      fatherName: 'Gurmail Singh',
      contactNo: '95692-11600',
      aadharNo: '3721-1091-8021',
      occupation: 'Toy shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-09-18',
        loanNumber: 'MG-2025-11',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Gurmail Singh',
      fatherName: 'Pillu Singh',
      contactNo: '78375-66252',
      aadharNo: '6179-5208-5175',
      occupation: 'Toy shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-09-18',
        loanNumber: 'MG-2025-12',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Gurcharn Singh',
      fatherName: 'Bhura Singh',
      contactNo: '94636-23262',
      aadharNo: '8059-4214-8321',
      occupation: 'Fruit shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-10-12',
        loanNumber: 'MG-2025-13',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Gurpreet Singh',
      fatherName: 'Dhanna Singh',
      contactNo: '98782-69428',
      aadharNo: '8392-1015-3967',
      occupation: 'M/c woreks',
      city: 'Mansa',
      address: 'Barnala khara',
      loanDetails: {
        loanAmount: 10000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-10-15',
        loanNumber: 'MG-2025-14',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: '5 days',
        tenure: 100,
      }
},
{name: 'Malkit Singh',
      fatherName: 'Buta Singh',
      contactNo: '84277-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 25000,
        interestRate: 24,
        totalEmi: 100,
        loanDate: '2025-10-22',
        loanNumber: 'MG-2025-15',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Amandeep Singh',
      fatherName: 'Gurmail Singh',
      contactNo: '78375-66252',
      aadharNo: '5822-9347-1059',
      occupation: 'Toy shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 27000,
        interestRate: 29.65,
        totalEmi: 100,
        loanDate: '2025-10-28',
        loanNumber: 'MG-2025-16',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Sandeep Singh',
      fatherName: 'Angrej Singh',
      contactNo: '62835-90835',
      aadharNo: '9059-8984-3731',
      occupation: 'Fast food',
      city: 'Mansa',
      address: 'Mann bibbrian',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-10-29',
        loanNumber: 'MG-2025-17',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Sandeep Singh',
      fatherName: 'Avtar Singh',
      contactNo: '70872-09008',
      aadharNo: '2539-6683-8202',
      occupation: 'Coffe shop',
      city: 'Bathinda',
      address: 'Gadhian wala sekhpura',
      loanDetails: {
        loanAmount: 12500,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-10-29',
        loanNumber: 'MG-2025-18',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Gurpreet Singh',
      fatherName: 'Mishra Singh',
      contactNo: '78140-20289',
      aadharNo: '4661-0253-2530',
      occupation: 'Jiuce shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 34000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-10-31',
        loanNumber: 'MG-2025-19',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Angrej Singh',
      fatherName: 'Niranjan Singh',
      contactNo: '75089-31665',
      aadharNo: '6198-5370-2872',
      occupation: 'Vegetable shop',
      city: 'Bathinda',
      address: 'near post office talwandi sabo',
      loanDetails: {
        loanAmount: 11850,
        interestRate: 20,
        totalEmi: 95,
        loanDate: '2025-11-03',
        loanNumber: 'MG-2025-20',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: ' Harmandeep',
      fatherName: 'Harpal Singh',
      contactNo: '6280139908',
      aadharNo: '4954-1128-1087',
      occupation: 'photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-11-04',
        loanNumber: 'MG-2025-21',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'weekly',
        tenure: 100,
      }
},
{name: 'Sandeep kumar',
      fatherName: 'Pawan kumar',
      contactNo: '98764-40750',
      aadharNo: '9706-6408-4871',
      occupation: 'Clouth house',
      city: 'Mansa',
      address: 'Vill. Jhunir,the.Sardulgarh',
      loanDetails: {
        loanAmount: 50000,
        interestRate: 10,
        totalEmi: 100,
        loanDate: '2025-11-08',
        loanNumber: 'MG-2025-22',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Sukhwinder Singh',
      fatherName: 'Amarjit Singh',
      contactNo: '98141-40789',
      aadharNo: '7431-9567-5461',
      occupation: 'Honda agency sales man talwandi',
      city: 'Bathinda',
      address: 'vill. Fathegarh nau abaad',
      loanDetails: {
        loanAmount: 10000,
        interestRate: 20,
        totalEmi: 10,
        loanDate: '2025-11-14',
        loanNumber: 'MG-2025-23',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'weekly 10',
        tenure: 100,
      }
},
{name: 'Jagtar Singh',
      fatherName: 'Bawa Singh',
      contactNo: '62808-39328',
      aadharNo: '2818-5699-6629',
      occupation: 'Namkeen shop',
      city: 'Bathinda',
      address: 'talwandi',
      loanDetails: {
        loanAmount: 200000,
        interestRate: 20,
        totalEmi: 20,
        loanDate: '2025-11-17',
        loanNumber: 'MG-2025-24',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'weekly 5',
        tenure: 100,
      }
},
{name: 'Gulab Singh',
      fatherName: 'Jaila Singh',
      contactNo: '98768-02018',
      aadharNo: '3836-2210-8179',
      occupation: 'Stiching',
      city: 'Mansa',
      address: 'vill. Ghurkani,the. sardulgarh',
      loanDetails: {
        loanAmount: 10000,
        interestRate: 20,
        totalEmi: 20,
        loanDate: '2025-11-17',
        loanNumber: 'MG-2025-25',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Weekly 5',
        tenure: 100,
      }
},
{name: 'Amritpal Singh',
      fatherName: 'Mithu Singh',
      contactNo: '98153-71297',
      aadharNo: '3826-0786-9771',
      occupation: 'Driver',
      city: 'Mansa',
      address: 'Vill. Ramditte wala mansa',
      loanDetails: {
        loanAmount: 15000,
        interestRate: 20,
        totalEmi: 10,
        loanDate: '2025-11-19',
        loanNumber: 'MG-2025-26',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Weekly 10',
        tenure: 100,
      }
},
{name: 'Davinder Singh',
      fatherName: 'Hardev Singh',
      contactNo: '9815423703',
      aadharNo: '4042-6359-9193',
      occupation: 'Stiching',
      city: 'Mansa',
      address: 'Vill. Ghurkani,the. sardulgarh',
      loanDetails: {
        loanAmount: 5000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-11-28',
        loanNumber: 'MG-2025-27',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Balwinder Singh',
      fatherName: 'Sukhvit Singh',
      contactNo: '62835-07085',
      aadharNo: '2396-1059-2510',
      occupation: 'Manyari shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 10000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-11-28',
        loanNumber: 'MG-2025-28',
        loanType: 'Daily', 
        status: 'Active',
        installmentFrequency: 'Weekly 10',
        tenure: 100,
      }
},
{name: 'Harmandeep',
      fatherName: 'Harpal Singh',
      contactNo: '62801-39908',
      aadharNo: '4954-1128-1087',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 30000,
        interestRate: 25,
        totalEmi: 20,
        loanDate: '2025-12-04',
        loanNumber: 'MG-2025-29',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Weekly 5',
        tenure: 100,
      }
},
{name: 'Butta Singh',
      fatherName: 'Kartar Singh',
      contactNo: '98729-22734',
      aadharNo: '9661-8664-.-0247',
      occupation: 'Furniture workrs',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 20000,
        interestRate: 25,
        totalEmi: 10,
        loanDate: '2025-12-05',
        loanNumber: 'MG-2025-30',
        loanType: 'Daily',
        status: 'Closed',
        installmentFrequency: 'Weekly 10',
        tenure: 100,
      }
},
{name: 'Inderpreet kaur',
      fatherName: 'w/o Pritpal singh',
      contactNo: '98775-74329',
      aadharNo: '7609-3598-8159',
      occupation: 'Bajaj agency workars',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 15000,
        interestRate: 20,
        totalEmi: 10,
        loanDate: '2025-12-10',
        loanNumber: 'MG-2025-31',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Weekly 10',
        tenure: 100,
      }
},
{name: 'Gurmail Singh',
      fatherName: 'Pillu Singh',
      contactNo: '78375-66252',
      aadharNo: '6179-5208-5175',
      occupation: 'Toy shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 30000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-12-13',
        loanNumber: 'MG-2025-32',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Sandeep kaur',
      fatherName: 'w/o Baljit Singh',
      contactNo: '78140-39944',
      aadharNo: '2396-0167-1659',
      occupation: 'Kreyana shop',
      city: 'Mansa',
      address: 'Vill. Ghurkani,The. sardulgarh',
      loanDetails: {
        loanAmount: 50000,
        interestRate: 10,
        totalEmi: 100,
        loanDate: '2025-12-15',
        loanNumber: 'MG-2025-33',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Harsh kumar',
      fatherName: 'Vikesh kumar',
      contactNo: '87088-54003',
      aadharNo: '2068-6368-6983',
      occupation: 'Auto parts',
      city: 'Mansa',
      address: 'Vill Jhunir',
      loanDetails: {
        loanAmount: 50000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2025-12-15',
        loanNumber: 'MG-2025-34',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Kuldeep singh',
      fatherName: 'Kala singh',
      contactNo: '79734-41755',
      aadharNo: '9790-2748-2865',
      occupation: 'Driver',
      city: 'Mansa',
      address: 'Vill.Ramditte wala',
      loanDetails: {
        loanAmount: 10000,
        interestRate: 20,
        totalEmi: 10,
        loanDate: '2025-12-21',
        loanNumber: 'MG-2025-35',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Weekly 10',
        tenure: 100,
      }
},

{name: 'Malkit singh',
      fatherName: 'Butta singh',
      contactNo: '84377-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'Photo shop',
      city: 'Bathinda',
      address: 'Vill. Talwandi sabo',
      loanDetails: {
        loanAmount: 40000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2025-12-22',
        loanNumber: 'MG-2025-36',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},

{name: 'Butta singh',
      fatherName: 'Kartar singh',
      contactNo: '98729-22734',
      aadharNo: '9661-8664-0247',
      occupation: 'Furniture works',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 25000,
        interestRate: 25,
        totalEmi: 10,
        loanDate: '2025-12-25',
        loanNumber: 'MG-2025-37',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Weekly 10',
        tenure: 100,
      }
},
{name: 'Gurpreet singh',
      fatherName: 'Gurmail singh',
      contactNo: '95892-18600',
      aadharNo: '3721-1091-8021',
      occupation: 'Toy shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 35000,
        interestRate: 15,
        totalEmi: 10,
        loanDate: '2025-12-29',
        loanNumber: 'MG-2025-38',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Weekly 10',
        tenure: 100,
      }},
      {name: 'Malkit singh',
      fatherName: 'Butta singh',
      contactNo: '84277-10305',
      aadharNo: '7559-7182-1625',
      occupation: 'photo shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 5000,
        interestRate: 100,
        totalEmi: 30,
        loanDate: '2025-12-30',
        loanNumber: 'MG-2025-39',
        loanType: 'short',
        status: 'Active',
        installmentFrequency: 'monthly',
        tenure: 30,
      }},
      {name: 'Sandeep singh',
      fatherName: 'Avtar singh',
      contactNo: '70872-09008',
      aadharNo: '2539-6683-8202',
      occupation: 'Coffe shop',
      city: 'Bathinda',
      address: 'Gadhian wala sekhupur',
      loanDetails: {
        loanAmount: 22000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2026-01-01',
        loanNumber: 'MG-2026-40',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }
},
{name: 'Ajay kumar',
      fatherName: 'Davender kumar',
      contactNo: '97289-99283',
      aadharNo: '5777-9883-1710',
      occupation: 'Crorkary shop',
      city: 'Bathinda',
      address: 'Lajpat nagar fatheyabad',
      loanDetails: {
        loanAmount: 30000,
        interestRate: 25,
        totalEmi: 100,
        loanDate: '2026-01-01',
        loanNumber: 'MG-2026-41',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }},
      {
        name: 'Jasvir singh',
      fatherName: 'Gian singh',
      contactNo: '98780-20179',
      aadharNo: '3091-1729-0506',
      occupation: 'fruit shop',
      city: 'Bathinda',
      address: 'Talwandi sabo',
      loanDetails: {
        loanAmount: 5000,
        interestRate: 20,
        totalEmi: 100,
        loanDate: '2026-01-02',
        loanNumber: 'MG-2026-42',
        loanType: 'Daily',
        status: 'Active',
        installmentFrequency: 'Daily',
        tenure: 100,
      }}];

  for (const data of customerData) {
    // Sanitize Aadhar (remove dots/spaces if necessary)
    const cleanAadhar = data.aadharNo.replace(/\s/g, '').replace(/\./g, '');

    // 1. Calculate Financials
    const calculated = calculateLoanData(
      data.loanDetails.loanAmount,
      data.loanDetails.interestRate,
      data.loanDetails.totalEmi
    );

    // 2. Upsert Customer
    let customer = await prisma.customer.findUnique({
        where: { aadharNo: data.aadharNo }
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                name: data.name.trim(),
                fatherName: data.fatherName,
                contactNo: data.contactNo,
                aadharNo: data.aadharNo,
                occupation: data.occupation,
                city: data.city,
                address: data.address
            }
        });
    }

    // 3. Check and Create Loan
    const existingLoan = await prisma.loan.findUnique({
        where: { loanNumber: data.loanDetails.loanNumber }
    });

    if (!existingLoan) {
        console.log(`Creating loan ${data.loanDetails.loanNumber} for ${data.name}...`);
        const newLoan = await prisma.loan.create({
            data: {
                customerId: customer.id,
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
            }
        });
        
        // 4. Generate installments
        await generateInstallmentsForLoan(newLoan.id);
        console.log(`   ✅ Installments generated for ${data.loanDetails.loanNumber}`);
    } else {
        console.log(`Loan ${data.loanDetails.loanNumber} already exists. Skipping.`);
    }
  }

  console.log('✅ Customer Seeding finished.');
}
