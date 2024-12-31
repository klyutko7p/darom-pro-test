import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  row: IOurRansom | IClientRansom | IDelivery;
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { row, flag } = await readBody<IRequestBody>(event);

    if (flag === "OurRansom" && "priceSite" in row) {
      const updateRow = await prisma.ourRansom.update({
        where: {
          id: row.id,
        },
        data: {
          id: row.id,
          clientLink1: row.clientLink1,
          cell: row.cell,
          name: row.name,
          fromName: row.fromName,
          productLink: row.productLink,
          productName: row.productName,
          notation: row.notation,
          priceSite: row.priceSite,
          prepayment: +row.prepayment,
          percentClient: row.percentClient,
          deliveredKGT: row.deliveredKGT,
          amountFromClient1: row.amountFromClient1,
          dispatchPVZ: row.dispatchPVZ,
          orderPVZ: row.orderPVZ,
          orderAccount: row.orderAccount,
          deliveredSC: row.deliveredSC
            ? new Date(row.deliveredSC).toISOString()
            : null,
          deliveredPVZ: row.deliveredPVZ
            ? new Date(row.deliveredPVZ).toISOString()
            : null,
          issued: row.issued ? new Date(row.issued).toISOString() : null,
          additionally: row.additionally,
          profit1: row.profit1,
          deleted: row.deleted,
          created_at: row.created_at,
          updated_at: row.updated_at,
          createdUser: row.createdUser,
          updatedUser: row.updatedUser,
          shipped: row.shipped ? new Date(row.shipped).toISOString() : null,
          verified: row.verified ? new Date(row.verified).toISOString() : null,
          priceRefund: row.priceRefund,
          dp: row.dp,
        },
      });
    } else if ("priceProgram" in row) {
      const updateRow = await prisma.clientRansom.update({
        where: {
          id: row.id,
        },
        data: {
          id: row.id,
          clientLink2: row.clientLink2,
          cell: row.cell,
          name: row.name,
          fromName: row.fromName,
          productLink: row.productLink,
          productName: row.productName,
          priceProgram: row.priceProgram,
          prepayment: +row.prepayment,
          percentClient: row.percentClient,
          deliveredKGT: row.deliveredKGT,
          amountFromClient2: row.amountFromClient2,
          dispatchPVZ: row.dispatchPVZ,
          orderPVZ: row.orderPVZ,
          deliveredSC: row.deliveredSC
            ? new Date(row.deliveredSC).toISOString()
            : null,
          deliveredPVZ: row.deliveredPVZ
            ? new Date(row.deliveredPVZ).toISOString()
            : null,
          issued: row.issued ? new Date(row.issued).toISOString() : null,
          additionally: row.additionally,
          profit2: row.profit2,
          deleted: row.deleted,
          created_at: row.created_at,
          updated_at: row.updated_at,
          createdUser: row.createdUser,
          updatedUser: row.updatedUser,
          img: row.img,
        },
      });
    } else if ("purchaseOfGoods" in row) {
      const updateRow = await prisma.delivery.update({
        where: {
          id: row.id,
        },
        data: {
          id: row.id,
          clientLink3: row.clientLink3,
          name: row.name,
          fromName: row.fromName,
          nameOfAction: row.nameOfAction,
          purchaseOfGoods: +row.purchaseOfGoods,
          percentClient: +row.percentClient,
          amountFromClient3: +row.amountFromClient3,
          dispatchPVZ: row.dispatchPVZ,
          sorted: row.sorted ? new Date(row.sorted).toISOString() : null,
          paid: row.paid ? new Date(row.paid).toISOString() : null,
          orderPVZ: row.orderPVZ,
          additionally: row.additionally,
          profit3: +row.profit3,
          deleted: row.deleted,
          created_at: row.created_at,
          updated_at: row.updated_at,
          createdUser: row.createdUser,
          updatedUser: row.updatedUser,
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
