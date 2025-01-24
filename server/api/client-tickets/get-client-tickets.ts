import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  clientId: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { clientId } = await readBody<IRequestBody>(event);

    const tickets = await prisma.clientTicket.findMany({
      where: {
        clientId,
      },
      orderBy: {
        id: "desc",
      },
    });
    return tickets;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
