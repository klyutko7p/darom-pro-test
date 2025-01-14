import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  transaction: Transaction;
}

export default defineEventHandler(async (event) => {
  try {
    const { transaction } = await readBody<IRequestBody>(event);

    const updateTransaction = await prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        sum: transaction.sum,
        fromBankId: transaction.fromBankId,
        toBankId: transaction.toBankId,
        createdUser: transaction.createdUser,
        type: transaction.type,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
