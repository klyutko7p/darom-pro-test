import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  payment: MonthlyPayment;
}

export default defineEventHandler(async (event) => {
  try {
    const { payment } = await readBody<IRequestBody>(event);

    const updatePayment = await prisma.monthlyPayment.update({
      where: {
        id: payment.id,
      },
      data: {
        company: payment.company,
        PVZ: payment.PVZ,
        date: payment.date ? new Date(payment.date).toISOString() : null,
        expenditure: payment.expenditure,
        typeOfExpenditure: payment.typeOfExpenditure,
        notation: payment.notation,
        type: payment.type,
        createdUser: payment.createdUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
