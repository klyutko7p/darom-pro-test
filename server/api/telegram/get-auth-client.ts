import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  phoneNumber: string;
  code: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber, code } = await readBody<IRequestBody>(event);

    const client = await prisma.telegramAuthClients.findFirst({
      where: {
        phoneNumber,
        code,
      },
      orderBy: {
        id: "desc",
      },
    });
    return client;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
