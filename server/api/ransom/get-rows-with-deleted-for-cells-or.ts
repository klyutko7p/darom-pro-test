import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const startDate = new Date("2024-06-01T00:00:00Z");
    const rows = await prisma.ourRansom.findMany({
      where: {
        created_at: {
          gt: startDate,
        },
      },
      select: {
        cell: true,
        dispatchPVZ: true,
        issued: true,
        fromName: true,
        deleted: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const processedRows = rows.map(row => {
      const newRow = {};

      if (row.cell !== undefined) newRow.cc = row.cell;
      if (row.fromName !== undefined) newRow.fm = row.fromName;
      if (row.dispatchPVZ !== undefined) newRow.dpz = row.dispatchPVZ;
      if (row.issued !== undefined) newRow.i = row.issued;
      if (row.deleted !== undefined) newRow.d = row.deleted;

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
