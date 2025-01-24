import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { id, flag } = await readBody<IRequestBody>(event);

    if (flag === 'OurRansom') {
      const row = await prisma.ourRansom.findUnique({
        where: {
          id: id,
        },
      })
      return row;
    } else if (flag === 'ClientRansom') {
      const row = await prisma.clientRansom.findUnique({
        where: {
          id: id,
        },
      })
      return row;
    } else if (flag === 'Delivery') {
      const row = await prisma.delivery.findUnique({
        where: {
          id: id,
        },
      })
      return row;
    } 

  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }

});
