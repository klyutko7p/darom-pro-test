import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    let { id, flag } = await readBody<IRequestBody>(event);
    if (flag === 'OurRansom') {
      const row = await prisma.ourRansom.findFirst({
        where: {
          id: id,
        }
      });
      if (row) {
        const rowData = await prisma.ourRansom.create({
          data: {
            clientLink1: row.clientLink1,
            cell: row.cell,
            name: row.name,
            fromName: row.fromName,
            productLink: row.productLink,
            productName: row.productName,
            priceSite: +row.priceSite,
            prepayment: +row.prepayment,
            percentClient: +row.percentClient,
            notation: row.notation,
            deliveredKGT: +row.deliveredKGT,
            amountFromClient1: +row.amountFromClient1,
            dispatchPVZ: row.dispatchPVZ,
            orderPVZ: row.orderPVZ,
            deliveredSC: null,
            deliveredPVZ: null,
            orderAccount: row.orderAccount,
            issued: null,
            additionally: row.additionally,
            profit1: +row.profit1,
            deleted: row.deleted,
            created_at: new Date(),
            updated_at: new Date(),
            createdUser: row.createdUser,
            updatedUser: row.updatedUser,
          },
        });
      }
    } else if (flag === 'ClientRansom') {
      const row = await prisma.clientRansom.findFirst({
        where: {
          id: id,
        }
      });
      if (row) {
        const rowData = await prisma.clientRansom.create({
          data: {
            clientLink2: row.clientLink2,
            cell: row.cell,
            name: row.name,
            fromName: row.fromName,
            productLink: row.productLink,
            productName: row.productName,
            priceProgram: +row.priceProgram,
            prepayment: +row.prepayment,
            percentClient: +row.percentClient,
            deliveredKGT: +row.deliveredKGT,
            amountFromClient2: +row.amountFromClient2,
            dispatchPVZ: row.dispatchPVZ,
            orderPVZ: row.orderPVZ,
            deliveredSC: null,
            deliveredPVZ: null,
            issued: null,
            additionally: row.additionally,
            profit2: +row.profit2,
            deleted: row.deleted,
            created_at: new Date(),
            updated_at: new Date(),
            createdUser: row.createdUser,
            updatedUser: row.updatedUser,
          },
        });
      }
    } else if (flag === 'Delivery') {
      const row = await prisma.delivery.findFirst({
        where: {
          id: id,
        }
      });
      if (row) {
        const rowData = await prisma.delivery.create({
          data: {
            clientLink3: row.clientLink3,
            name: row.name,
            fromName: row.fromName,
            nameOfAction: row.nameOfAction,
            purchaseOfGoods: +row.purchaseOfGoods,
            percentClient: +row.percentClient,
            amountFromClient3: +row.amountFromClient3,
            dispatchPVZ: row.dispatchPVZ,
            sorted: null,
            paid: null,
            orderPVZ: row.orderPVZ,
            additionally: row.additionally,
            profit3: +row.profit3,
            deleted: row.deleted,
            created_at: new Date(),
            updated_at: new Date(),
            createdUser: row.createdUser,
            updatedUser: row.updatedUser,
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
      return { error: error.message };
    }
  }
});
