import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const startDate = new Date("2024-04-01T00:00:00Z");

    const rows = await prisma.ourRansom.findMany({
      select: {
        verified: true,
        priceRefund: true,
        additionally: true,
        priceSite: true,
        deliveredKGT: true,
        issued: true,
        dispatchPVZ: true,
        amountFromClient1: true,
        prepayment: true,
        percentClient: true,
        profit1: true,
        deleted: true,
      },
      where: {
        created_at: {
          gt: startDate,
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
