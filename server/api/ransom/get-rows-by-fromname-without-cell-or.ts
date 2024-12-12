import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  fromName: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { fromName } = await readBody<IRequestBody>(event);

    const rows = await prisma.ourRansom.findMany({
      where: {
        fromName: fromName,
      },
      orderBy: [
        {
          issued: "desc",
        },
        {
          deliveredSC: "desc",
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
