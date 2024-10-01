import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  clientId: number;
  uniqueCode: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { clientId, uniqueCode } = await readBody<IRequestBody>(event);

    await prisma.clientTicket.create({
      data: {
        clientId: clientId,
        uniqueCode: uniqueCode,
      },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
