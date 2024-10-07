import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  row: IPayroll;
}

export default defineEventHandler(async (event) => {
  try {
    let { row } = await readBody<IRequestBody>(event);
    const rowData = await prisma.payroll.create({
      data: {
        id: row.id,
        PVZ: row.PVZ,
        company: row.company,
        fullname: row.fullname,
        phone: row.phone,
        bank: row.bank,
        paymentPerShift: +row.paymentPerShift,
        advance: +row.advance,
        advanceFourssan: +row.advanceFourssan,
        salaryFourssan: +row.salaryFourssan,
        hours: +row.hours,
        deductions: +row.deductions,
        additionalPayment: +row.additionalPayment,
        notation: row.notation,
        date: row.date ? new Date(row.date).toISOString() : null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
