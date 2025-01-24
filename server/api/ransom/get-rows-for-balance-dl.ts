import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const rows = await prisma.delivery.findMany({
      select: {
        nameOfAction: true,
        paid: true,
        dispatchPVZ: true,
        amountFromClient3: true,
        orderPVZ: true,
      },
      where: {
        paid: {
          not: null,
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return rows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
