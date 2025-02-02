import { PrismaClient } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

const prisma = new PrismaClient();

interface IRequestBody {
  name: string;
  year: number;
  monthIndex: number;
  hours: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { name, year, monthIndex, hours } = await readBody<IRequestBody>(
      event
    );

    const startDate = startOfMonth(new Date(year, monthIndex));
    const endDate = endOfMonth(new Date(year, monthIndex));

    const updateRow = await prisma.payroll.updateMany({
      where: {
        fullname: {
          contains: name,
          mode: "insensitive",
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      data: {
        hours: hours,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
