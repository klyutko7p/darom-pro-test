import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const rows = await prisma.advanceReport.findMany({
      where: {
        received: null,
        issuedUser: {
          not: null,
        },
        notation: {
          not: "Пополнение баланса",
        },
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          created_at: "desc",
        },
      ],
    });
    return rows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
