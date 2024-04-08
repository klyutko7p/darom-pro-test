import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  task: Task;
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { task, flag } = await readBody<IRequestBody>(event);

    if (flag === "DONE") {
      const updateTask = await prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          done: new Date(),
        },
      });
    } else if (flag === "CHECKED") {
      const updateTask = await prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          checked: new Date(),
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
