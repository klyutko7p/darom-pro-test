import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  name: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { name } = await readBody<IRequestBody>(event);

    const rows = await prisma.payroll.findMany({
      where: {
        fullname: {
          contains: name, 
          mode: "insensitive", 
        },
      },
      orderBy: [
        {
          PVZ: "asc",
        },
        {
          fullname: "asc",
        },
      ],
    });

    return rows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
