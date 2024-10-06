import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    await prisma.clientRansom.updateMany({
      where: {
        deliveredSC: null,
        created_at: {
          lt: twentyFourHoursAgo,
        },
      },
      data: {
        deleted: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
