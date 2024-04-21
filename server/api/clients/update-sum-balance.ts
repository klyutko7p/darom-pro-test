import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
  balance: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id, balance } = await readBody<IRequestBody>(event);

    const clientsData = await prisma.client.update({
      where: {
        id,
      },
      data: {
        balance,
      },
    });
    return clientsData;
  } catch (error) {
    console.error(error);
    return error;
  }
});
