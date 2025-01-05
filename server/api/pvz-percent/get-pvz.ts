import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const pvzData = await prisma.pVZPercent.findMany({
      include: {
        pvz: true,
      },
      orderBy: [
        {
          id: "asc",
        },
      ],
    });
    return pvzData;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
