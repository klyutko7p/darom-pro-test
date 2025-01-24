import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const allTypes = await prisma.autoType.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return allTypes;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
