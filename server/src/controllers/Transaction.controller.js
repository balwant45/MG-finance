import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST /transactions/capital
export const injectCapital = async (req, res) => {
    try {
        // Notice: I removed description and paymentMethod from the payload we pass to Prisma
        const { amount, date, category } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Please enter a valid amount." });
        }

        // 1. Generate a unique transaction code (e.g., "CAP-1689123456789")
        const transactionCode = `CAP-${Date.now()}`;

        // 2. Create the transaction
        const newCapital = await prisma.transaction.create({
            data: {
                code: transactionCode,         // ✅ FIX: Added required code
                type: 'Credit',                // ✅ FIX: Added required type (Money In)
                amount: parseFloat(amount),
                date: new Date(date),
                category: category || "Capital_Investment", 
                
                // ❌ Removed description & paymentMethod because they are not in your schema!
            }
        });

        res.status(201).json(newCapital);

    } catch (error) {
        console.error("Error injecting capital:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};