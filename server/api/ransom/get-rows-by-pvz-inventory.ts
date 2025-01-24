import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface IRequestBody {
  PVZ: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { PVZ } = await readBody<IRequestBody>(event);

    const rows = await prisma.ourRansom.findMany({
      where: {
        dispatchPVZ: PVZ,
        deleted: null,
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
