import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";

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

    const processedRows = rows.map((row) => {
      const newRow = {};

      if (row.id !== undefined) newRow.id = row.id;
      if (row.PVZ !== null) newRow.dpz = row.PVZ;
      if (row.date !== undefined) newRow.da = row.date;
      if (row.issuedUser !== null) newRow.iu = row.issuedUser;
      if (row.expenditure !== null) newRow.ex = row.expenditure;
      if (row.typeOfExpenditure !== undefined)
        newRow.te = row.typeOfExpenditure;
      if (row.notation !== null) newRow.nt = row.notation;
      if (row.company !== null) newRow.cm = row.company;
      if (row.supportingDocuments !== undefined)
        newRow.sd = row.supportingDocuments;
      if (row.type !== undefined) newRow.ty = row.type;
      if (row.createdUser !== undefined) newRow.cu = row.createdUser;
      if (row.received !== undefined) newRow.r = row.received;
      if (row.created_at !== undefined) newRow.c = row.created_at;

      return newRow;
    });

    const packed = msgpack.encode(processedRows);
    return packed;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
