import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  row: IAdvanceReport;
}

export default defineEventHandler(async (event) => {
  try {
    let { row } = await readBody<IRequestBody>(event);
    const rowData = await prisma.advanceReport.create({
      data: {
        id: row.id,
        PVZ: row.PVZ,
        notation: row.notation,
        company: row.company,
        expenditure: row.expenditure,
        typeOfExpenditure: row.typeOfExpenditure,
        type: row.type,
        issuedUser: row.issuedUser,
        date: row.date ? new Date(row.date).toISOString() : null,
        supportingDocuments: row.supportingDocuments,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
      return { error: error.message };
    }
  }
});
