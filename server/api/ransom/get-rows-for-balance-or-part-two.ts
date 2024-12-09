import { PrismaClient } from "@prisma/client";
import * as msgpack from '@msgpack/msgpack';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const rows = await prisma.ourRansom.findMany({
      skip: 17000,
      take: 17000,
      select: {
        dispatchPVZ: true,
        prepayment: true,
        additionally: true,
        deliveredKGT: true,
        amountFromClient1: true,
        issued: true,
        priceSite: true,
        deleted: true,
        created_at: true,
        dp: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const processedRows = rows.map(row => {
      const newRow = {};

      if (row.dispatchPVZ !== undefined) newRow.dpz = row.dispatchPVZ;
      if (row.prepayment !== 0) newRow.pp = row.prepayment;
      if (row.dp !== undefined) newRow.dp = row.dp;
      if (row.additionally !== null) newRow.ad = row.additionally;
      if (row.deliveredKGT !== 0) newRow.dk = row.deliveredKGT;
      if (row.amountFromClient1 !== undefined) newRow.ac = row.amountFromClient1;
      if (row.issued !== null) newRow.i = row.issued;
      if (row.priceSite !== undefined) newRow.p = row.priceSite;
      if (row.deleted !== null) newRow.d = row.deleted;
      if (row.created_at !== undefined) newRow.c = row.created_at;

      return newRow;
    });

    const packed = msgpack.encode(processedRows);
    return packed;
  } catch (error) {
    console.error(error.message);
    return { error: error.message };
  }
});
