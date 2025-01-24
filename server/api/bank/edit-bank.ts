import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  bank: Bank;
}

export default defineEventHandler(async (event) => {
  try {
    const { bank } = await readBody<IRequestBody>(event);

    const updateBank = await prisma.bank.update({
      where: {
        id: bank.id,
      },
      data: {
        name: bank.name,
        img: bank.img,
        main: bank.main,
        money: bank.money,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
