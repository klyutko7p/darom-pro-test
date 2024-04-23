import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return tasks;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
