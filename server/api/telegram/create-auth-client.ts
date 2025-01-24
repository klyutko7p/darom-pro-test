import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  client: any;
}

export default defineEventHandler(async (event) => {
  try {
    const { client } = await readBody<IRequestBody>(event);

    const clientCreate = await prisma.telegramAuthClients.create({
      data: {
        phoneNumber: client.phoneNumber,
        code: client.code,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
