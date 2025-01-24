import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const orderAccount = await prisma.orderAccount.findMany({
      orderBy: {
        id: "desc",
      },
      where: {
        active: true,
      },
    });
    return orderAccount;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
