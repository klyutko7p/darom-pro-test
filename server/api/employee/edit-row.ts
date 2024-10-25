import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  row: IEmployee;
}

export default defineEventHandler(async (event) => {
  try {
    const { row } = await readBody<IRequestBody>(event);
    const updateRow = await prisma.employee.update({
      where: {
        id: row.id,
      },
      data: {
        id: row.id,
        PVZ: row.PVZ,
        company: row.company,
        fullname: row.fullname,
        phone: row.phone,
        job: row.job,
        bank: row.bank,
        paymentPerShift: +row.paymentPerShift,
        hoursPerShift: +row.hoursPerShift,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
