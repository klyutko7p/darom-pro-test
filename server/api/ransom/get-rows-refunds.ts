import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    let { flag } = await readBody<IRequestBody>(event);
    const startDate = new Date("2024-03-21T00:00:00Z");

    if (flag === "OurRansom") {
      const now = new Date(); 
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7); 

      const rows = await prisma.ourRansom.findMany({
        where: {
          OR: [
            { additionally: "Отказ клиент наличные" },
            { additionally: "Отказ клиент онлайн" },
            { additionally: "Отказ клиент" },
            { additionally: "Отказ брак" },
          ],
          issued: {
            gt: startDate,
          },
          AND: [
            {
              OR: [
                { verified: null },
                {
                  verified: {
                    not: null,
                    gte: weekAgo,
                    lte: now,
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          created_at: "desc",
        },
      });
      return rows;
    } else if (flag === "ClientRansom") {
      const rows = await prisma.clientRansom.findMany({
        orderBy: {
          created_at: "desc",
        },
      });
      return rows;
    } else if (flag === "Delivery") {
      const rows = await prisma.delivery.findMany({
        orderBy: {
          created_at: "desc",
        },
      });
      return rows;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
