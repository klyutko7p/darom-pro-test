import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const startDate = new Date("2024-04-01T00:00:00Z");

    const rows = await prisma.ourRansom.findMany({
      where: {
        created_at: {
          gt: startDate,
        },
      },
      select: {
        fromName: true,
        dispatchPVZ: true,
        deliveredPVZ: true,
        deliveredSC: true,
        cell: true,
        issued: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const processedRows = rows.map(row => {
      const newRow = {};
      if (row.fromName !== undefined) newRow.fm = row.fromName;
      if (row.dispatchPVZ !== undefined) newRow.dp = row.dispatchPVZ;
      if (row.deliveredPVZ !== undefined) newRow.dz = row.deliveredPVZ;
      if (row.deliveredSC !== undefined) newRow.ds = row.deliveredSC;
      if (row.cell !== undefined) newRow.cc = row.cell;
      if (row.issued !== null) newRow.i = row.issued;

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
