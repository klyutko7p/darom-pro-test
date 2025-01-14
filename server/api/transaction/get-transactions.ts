import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const transactionsData = await prisma.transaction.findMany({
      include: {
        fromBank: true,
        toBank: true,
      },
      orderBy: [
        {
          id: "desc",
        },
      ],
    });
    return transactionsData;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
