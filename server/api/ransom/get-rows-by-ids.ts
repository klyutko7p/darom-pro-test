import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface IRequestBody {
  idRows: number[];
}

export default defineEventHandler(async (event) => {
  try {
    const { idRows } = await readBody<IRequestBody>(event);

    if (!idRows || !Array.isArray(idRows)) {
      throw new Error("idRows must be an array of numbers.");
    }

    const rows = await prisma.ourRansom.findMany({
      where: {
        id: {
          in: idRows, 
        },
      },
      orderBy: [
        {
          created_at: "desc",
        },
      ],
    });

    return rows;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
