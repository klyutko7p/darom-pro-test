import { PrismaClient } from "@prisma/client";
import * as msgpack from '@msgpack/msgpack';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const rows = await prisma.ourRansom.findMany({
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
      },
      orderBy: {
        created_at: "desc",
      },
    });

    rows.forEach((row) => {
      if (row.prepayment === 0) {
        delete row.prepayment;
      }

      if (row.deliveredKGT === 0) {
        delete row.deliveredKGT;
      }

      if (row.additionally === null) {
        delete row.additionally;
      }

      if (row.issued === null) {
        delete row.issued;
      }

      if (row.deleted === null) {
        delete row.deleted;
      }

    });
    const packed = msgpack.encode(rows);
    return packed;
  } catch (error) {
    console.error(error.message);
    return { error: error.message };
  }
});
