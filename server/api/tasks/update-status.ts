import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  task: Task;
  flag: string;
  username: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { task, flag, username } = await readBody<IRequestBody>(event);

    if (flag === "done") {
      const updateTask = await prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          done: new Date(),
        },
      });
    } else if (flag === "done-uncheck") {
      const updateTask = await prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          done: null,
        },
      });
    } else if (flag === "check") {
      const updateTask = await prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          checked: new Date(),
          checkedUser: username,
        },
      });
    } else if (flag === "refinement") {
      const updateTask = await prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          refinement: new Date(),
          done: null,
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
