import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody<IRequestBody>(event);

    const clientData = await prisma.client.findFirst({
      where: {
        id
      },
    });
    return clientData;
  } catch (error) {
    console.error(error);
    return error;
  }
});
