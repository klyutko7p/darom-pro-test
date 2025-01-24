import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { flag } = await readBody<IRequestBody>(event);
    if (flag === "not-all") {
      const pvz = await prisma.pVZ.findMany();
      return pvz;
    } else if (flag === "all") {
      const pvz = await prisma.allPVZ.findMany({
        orderBy: [
          {
            name: "asc",
          },
        ],
      });
      return pvz;
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
