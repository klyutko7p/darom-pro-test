import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const equipments = await prisma.autoRow.findMany({
      include: {
        autoType: true,
        updatedUser: true,
        DecommissionedAutoRow: true,
      },
      orderBy: {
        id: "desc",
      },
    });
    return equipments;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
