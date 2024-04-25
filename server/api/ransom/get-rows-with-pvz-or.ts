import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const rows = await prisma.ourRansom.findMany({
      select: {
        deliveredPVZ: true,
        deliveredSC: true,
        issued: true,
        dispatchPVZ: true,
        deleted: true,
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
