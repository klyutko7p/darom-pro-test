import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const boxesData = await prisma.box.findMany({
      orderBy: [
        {
          id: "asc",
        },
      ],
    });
    return boxesData;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
