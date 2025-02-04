import { PrismaClient } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

const prisma = new PrismaClient();

interface IRequestBody {
  name: string;
  year: number;
  monthIndex: number;
  hours: number;
  pvz: string;
  company: string;
}

function getISODateTime(dateData: Date | string | number) {
  const date = new Date(dateData);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  const outputDate = `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
  return outputDate;
}

export default defineEventHandler(async (event) => {
  const { name, year, monthIndex, hours, pvz, company } =
    await readBody<IRequestBody>(event);
  const startDate = getISODateTime(
    startOfMonth(new Date(year, monthIndex - 1))
  );
  const endDate = getISODateTime(endOfMonth(new Date(year, monthIndex - 1)));
  try {
    const updateRow = await prisma.payroll.updateMany({
      where: {
        fullname: name,
        PVZ: pvz,
        company: company,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      data: {
        hours: hours,
      },
    });

    return {
      success: true,
      updateRow: updateRow,
      gte: startDate,
      lte: endDate,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, gte: startDate, lte: endDate };
    }
  }
});
