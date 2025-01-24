import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  task: Task;
}

export default defineEventHandler(async (event) => {
  try {
    const { task } = await readBody<IRequestBody>(event);

    const updateTask = await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        description: task.description,
        responsible: task.responsible,
        deadline: new Date(task.deadline).toISOString(),
        notation: task.notation,
        done: task.done ? new Date(task.done).toISOString() : null,
        supportingDocuments: task.supportingDocuments,
        checked: task.checked ? new Date(task.checked).toISOString() : null,
        refinement: task.refinement
          ? new Date(task.refinement).toISOString()
          : null,
        checkedUser: task.checkedUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
