import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  task: Task;
}

export default defineEventHandler(async (event) => {
  try {
    const { task } = await readBody<IRequestBody>(event);

    const taskCreate = await prisma.task.create({
      data: {
        description: task.description,
        notation: task.notation,
        responsible: task.responsible,
        deadline: new Date(task.deadline).toISOString(),
        createdUser: task.createdUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
