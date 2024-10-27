import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  user: User;
}

export default defineEventHandler(async (event) => {
  try {
    const { user } = await readBody<IRequestBody>(event);
    let rows;
    if (user.username === "Власенкова") {
      rows = await prisma.advanceReport.findMany({
        orderBy: [
          {
            created_at: "desc",
          },
          {
            date: "desc",
          },
        ],
      });
    } else {
      rows = await prisma.advanceReport.findMany({
        orderBy: [
          {
            date: "desc",
          },
          {
            created_at: "desc",
          },
        ],
      });
    }

    return rows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
