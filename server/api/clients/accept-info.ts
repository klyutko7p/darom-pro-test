import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface IRequestBody {
  client: Client;
}

export default defineEventHandler(async (event) => {
  try {
    const { client } = await readBody<IRequestBody>(event);

    await prisma.client.update({
      where: {
        id: client.id,
      },
      data: {
        age: Number(client.age),
        gender: client.gender,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
