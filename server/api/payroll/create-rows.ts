import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    rows: IPayroll[];
}

export default defineEventHandler(async (event) => {
    try {
        let { rows } = await readBody<IRequestBody>(event);
        const createdRows = await prisma.payroll.createMany({
            data: rows.map(payroll => ({
                PVZ: payroll.PVZ,
                company: payroll.company,
                fullname: payroll.fullname,
                phone: payroll.phone,
                bank: payroll.bank,
                paymentPerShift: payroll.paymentPerShift,
                advance: payroll.advance,
                hours: payroll.hours,
                deductions: payroll.deductions,
                additionalPayment: payroll.additionalPayment,
                notation: payroll.notation,
                date: payroll.date ? new Date(payroll.date).toISOString() : null,
            }))
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }
});
