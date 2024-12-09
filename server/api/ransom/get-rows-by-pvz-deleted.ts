import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";
const prisma = new PrismaClient();

interface IRequestBody {
  PVZ: string;
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { PVZ, flag } = await readBody<IRequestBody>(event);

    if (flag === "OurRansom") {
      const rows = await prisma.ourRansom.findMany({
        select: {
          cell: true,
          fromName: true,
          deleted: true,
          dispatchPVZ: true,
          deliveredSC: true,
          issued: true,
          deliveredPVZ: true,
          orderPVZ: true,
        },
        where: {
          dispatchPVZ: PVZ,
        },
        orderBy: [
          {
            created_at: "desc",
          },
        ],
      });

      const processedRows = rows.map(row => {
        const newRow = {};
  
        if (row.cell !== undefined) newRow.cc = row.cell;
        if (row.fromName !== undefined) newRow.fm = row.fromName;
        if (row.dispatchPVZ !== undefined) newRow.dp = row.dispatchPVZ;
        if (row.deliveredSC !== undefined) newRow.ds = row.deliveredSC;
        if (row.deliveredPVZ !== undefined) newRow.dz = row.deliveredPVZ;
        if (row.orderPVZ !== undefined) newRow.oz = row.orderPVZ;
        if (row.issued !== undefined) newRow.i = row.issued;
        if (row.deleted !== undefined) newRow.d = row.deleted;
  
        return newRow;
      });
  
      const packed = msgpack.encode(processedRows);
      return packed;
    } else if (flag === "ClientRansom") {
      const rows = await prisma.clientRansom.findMany({
        where: {
          dispatchPVZ: PVZ,
        },
        orderBy: [
          {
            created_at: "desc",
          },
        ],
      });
      return rows;
    }
    // else if (flag === 'Delivery') {
    //     const rows = await prisma.delivery.findMany({
    //         where: {
    //             clientLink3: link,
    //             deleted: null,
    //         },
    //         orderBy: {
    //             created_at: 'desc',
    //         }
    //     });
    //     return rows;
    // }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
