import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const banksData = await prisma.bank.findMany({
      include: {
        incoming: true,
        outgoing: true,
      },
      orderBy: [
        {
          id: "asc",
        },
      ],
    });
    return banksData;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
