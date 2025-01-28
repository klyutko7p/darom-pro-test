import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const result = await prisma.ourRansom.updateMany({
      where: {
        created_at: {
          gte: new Date("2025-01-01"),
          lte: new Date(new Date().setDate(new Date().getDate() - 11)),
        },
        issued: null,
        dp: false,
        deleted: null,
      },
      data: {
        dp: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
