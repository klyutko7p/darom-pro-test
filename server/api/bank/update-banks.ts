import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  banks: Bank[];
}

export default defineEventHandler(async (event) => {
  try {
    let { banks } = await readBody<IRequestBody>(event);

    for (const bank of banks) {
      const updatedBank = await prisma.bank.update({
        where: { id: bank.id },
        data: {
          main: bank.main,
        },
      });
    }
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
