import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  row: IEmployee;
}

export default defineEventHandler(async (event) => {
  try {
    let { row } = await readBody<IRequestBody>(event);
    const rowData = await prisma.employee.create({
      data: {
        id: row.id,
        PVZ: row.PVZ,
        company: row.company,
        fullname: row.fullname,
        phone: row.phone,
        bank: row.bank,
        paymentPerShift: +row.paymentPerShift,
        hoursPerShift: +row.hoursPerShift,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
      return { error: error.message };
    }
  }
});
