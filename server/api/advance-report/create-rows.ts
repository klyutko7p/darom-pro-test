import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  rows: IAdvanceReport[];
}

export default defineEventHandler(async (event) => {
  try {
    let { rows } = await readBody<IRequestBody>(event);
    const createdRows = await prisma.advanceReport.createMany({
      data: rows.map((row) => ({
        id: row.id,
        PVZ: row.PVZ,
        notation: row.notation,
        company: row.company,
        expenditure: Number(row.expenditure),
        typeOfExpenditure: row.typeOfExpenditure,
        type: row.type,
        issuedUser: row.issuedUser,
        date: row.date ? new Date(row.date).toISOString() : null,
        supportingDocuments: row.supportingDocuments,
        createdUser: row.createdUser,
        received: row.received ? new Date(row.received).toISOString() : null,
      })),
    });

    for (const row of rows) {
      if (
        [
          "Перевод с баланса безнал",
          "Новый кредит безнал",
          "Пополнение баланса",
          "Удержания с сотрудников",
        ].includes(row.typeOfExpenditure) &&
        row.type === "Безнал"
      ) {
        const maxId = await prisma.advanceReport.aggregate({
          _max: { id: true },
        });

        await prisma.transaction.create({
          data: {
            type: "incoming",
            sum: Number(row.expenditure),
            createdUser: row.createdUser,
            fromBankId: 2,
            toBankId: 2,
            idRow: (maxId._max.id || 0) + 1,
          },
        });
      } else if (
        ![
          "Перевод с баланса безнал",
          "Новый кредит безнал",
          "Пополнение баланса",
          "Удержания с сотрудников",
        ].includes(row.typeOfExpenditure) &&
        row.type === "Безнал"
      ) {
        const maxId = await prisma.advanceReport.aggregate({
          _max: { id: true },
        });

        await prisma.transaction.create({
          data: {
            type: "expenditure",
            sum: Number(row.expenditure),
            createdUser: row.createdUser,
            fromBankId: 2,
            toBankId: 2,
            idRow: (maxId._max.id || 0) + 1,
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
