import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  row: IBalance;
}

export default defineEventHandler(async (event) => {
  try {
    let { row } = await readBody<IRequestBody>(event);
    const rowData = await prisma.balance.create({
      data: {
        id: row.id,
        pvz: row.pvz,
        sum: row.sum,
        issued: row.issued,
        received: row.received,
        notation: row.notation,
        receivedUser: row.receivedUser,
        receivedUser2: row.receivedUser,
        createdUser: row.createdUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
      return { error: error.message };
    }
  }
});
