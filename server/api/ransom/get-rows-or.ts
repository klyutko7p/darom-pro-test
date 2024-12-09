import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const rows = await prisma.ourRansom.findMany({
      where: {
        deleted: null,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const processedRows = rows.map((row) => {
      const newRow = {};
      if (row.id !== undefined) newRow.id = row.id;
      if (row.notation !== undefined) newRow.nt = row.notation;
      if (row.clientLink1 !== undefined) newRow.cl = row.clientLink1;
      if (row.productLink !== undefined) newRow.pl = row.productLink;
      if (row.productName !== undefined) newRow.pn = row.productName;
      if (row.prepayment !== undefined) newRow.pp = row.prepayment;
      if (row.priceSite !== undefined) newRow.p = row.priceSite;
      if (row.percentClient !== undefined) newRow.pc = row.percentClient;
      if (row.deliveredKGT !== undefined) newRow.dk = row.deliveredKGT;
      if (row.fromName !== undefined) newRow.fm = row.fromName;
      if (row.amountFromClient1 !== undefined) newRow.ac = row.amountFromClient1;
      if (row.orderAccount !== undefined) newRow.oa = row.orderAccount;
      if (row.additionally !== undefined) newRow.ad = row.additionally;
      if (row.profit1 !== undefined) newRow.pf1 = row.profit1;
      if (row.deleted !== undefined) newRow.d = row.deleted;
      if (row.created_at !== undefined) newRow.c = row.created_at;
      if (row.updated_at !== undefined) newRow.u = row.updated_at;
      if (row.createdUser !== undefined) newRow.cu = row.createdUser;
      if (row.updatedUser !== undefined) newRow.uu = row.updatedUser;
      if (row.orderPVZ !== undefined) newRow.oz = row.orderPVZ;
      if (row.dispatchPVZ !== undefined) newRow.dpz = row.dispatchPVZ;
      if (row.dp !== undefined) newRow.dp = row.dp;
      if (row.deliveredPVZ !== undefined) newRow.dz = row.deliveredPVZ;
      if (row.deliveredSC !== undefined) newRow.ds = row.deliveredSC;
      if (row.cell !== undefined) newRow.cc = row.cell;
      if (row.issued !== undefined) newRow.i = row.issued;

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
