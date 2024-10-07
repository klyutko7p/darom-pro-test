import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  rows: IPayroll[];
}

export default defineEventHandler(async (event) => {
  try {
    let { rows } = await readBody<IRequestBody>(event);

    for (const payroll of rows) {
      const updatedRow = await prisma.payroll.update({
        where: { id: payroll.id },
        data: {
          advance: payroll.advance,
          advanceFourssan: +payroll.advanceFourssan,
          salaryFourssan: +payroll.salaryFourssan,
          hours: payroll.hours,
          deductions: payroll.deductions,
          additionalPayment: payroll.additionalPayment,
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
