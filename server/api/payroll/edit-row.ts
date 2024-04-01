import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    row: IPayroll;
}


export default defineEventHandler(async (event) => {
    try {
        const { row } = await readBody<IRequestBody>(event);
        const updateRow = await prisma.payroll.update({
            where: {
                id: row.id,
            },
            data: {
                id: row.id,
                PVZ: row.PVZ,
                company: row.company,
                fullname: row.fullname,
                phone: row.phone,
                bank: row.bank,
                paymentPerShift: +row.paymentPerShift,
                advance: +row.advance,
                hours: +row.hours,
                deductions: +row.deductions,
                additionalPayment: +row.additionalPayment,
                notation: row.notation,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
