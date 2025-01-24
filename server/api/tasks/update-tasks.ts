import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  rows: Task[];
}

export default defineEventHandler(async (event) => {
  try {
    let { rows } = await readBody<IRequestBody>(event);

    for (const task of rows) {
      const updatedRow = await prisma.task.update({
        where: { id: task.id },
        data: {
          notation: task.notation,
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
