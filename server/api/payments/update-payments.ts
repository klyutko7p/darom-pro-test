import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  payments: MonthlyPayment[];
}

export default defineEventHandler(async (event) => {
  try {
    let { payments } = await readBody<IRequestBody>(event);
    for (const row of payments) {
      const updatedRow = await prisma.monthlyPayment.update({
        where: { id: row.id },
        data: {
          expenditure: row.expenditure,
        },
      });
    }
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
