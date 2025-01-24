import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  transaction: Transaction;
}

export default defineEventHandler(async (event) => {
  try {
    const { transaction } = await readBody<IRequestBody>(event);
    const transactionData = await prisma.transaction.create({
      data: {
        sum: transaction.sum,
        createdUser: transaction.createdUser,
        fromBankId: transaction.fromBankId,
        toBankId: transaction.toBankId,
        type: transaction.type,
        idRow: transaction.idRow,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
