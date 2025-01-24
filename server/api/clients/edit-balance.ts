import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


interface IRequestBody {
  phoneNumber: string;
  balance: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber, balance } = await readBody<IRequestBody>(event);
    const updateClient = await prisma.client.update({
      where: {
        phoneNumber,
      },
      data: {
        balance,
      },
  })
 
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
