import { PrismaClient } from "@prisma/client";
import * as msgpack from '@msgpack/msgpack';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const startDate = new Date("2024-07-01T00:00:00Z");

    const rows = await prisma.ourRansom.findMany({
      select: {
        verified: true,
        priceRefund: true,
        additionally: true,
        priceSite: true,
        deliveredKGT: true,
        issued: true,
        dispatchPVZ: true,
        amountFromClient1: true,
        prepayment: true,
        percentClient: true,
        profit1: true,
        deleted: true,
      },
      where: {
        created_at: {
          gt: startDate,
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });


    const processedRows = rows.map(row => {
      const newRow = {};

      if (row.verified !== undefined) newRow.v = row.verified;
      if (row.priceRefund !== undefined) newRow.pr = row.priceRefund;
      if (row.dispatchPVZ !== undefined) newRow.dp = row.dispatchPVZ;
      if (row.prepayment !== undefined) newRow.pp = row.prepayment;
      if (row.additionally !== undefined) newRow.ad = row.additionally;
      if (row.deliveredKGT !== undefined) newRow.dk = row.deliveredKGT;
      if (row.amountFromClient1 !== undefined) newRow.ac = row.amountFromClient1;
      if (row.issued !== undefined) newRow.i = row.issued;
      if (row.priceSite !== undefined) newRow.p = row.priceSite;
      if (row.profit1 !== undefined) newRow.pf1 = row.profit1;
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
