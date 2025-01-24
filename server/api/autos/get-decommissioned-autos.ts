import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const autos = await prisma.decommissionedAutoRow.findMany({
      include: {
        decommissionedUser: true,
        autoRow: {
          include: {
            autoType: true,
            updatedUser: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    return autos;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
