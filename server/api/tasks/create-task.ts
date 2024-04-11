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
        done: task.done ? new Date(task.done).toISOString() : null,
        checked: task.checked ? new Date(task.checked).toISOString() : null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
