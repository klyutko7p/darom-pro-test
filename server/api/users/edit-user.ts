import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    user: User;
}


export default defineEventHandler(async (event) => {
    try {
        const { user } = await readBody<IRequestBody>(event);

        const updateUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                username: user.username,
                role: user.role,
                PVZ: user.PVZ,
                visibleSC: user.visibleSC,
                visiblePVZ: user.visiblePVZ,
                cell1: user.cell1,
                cell2: user.cell2,
                additionally1: user.additionally2,
                additionally2: user.additionally2,
                additionally3: user.additionally3,
                deliveredSC1: user.deliveredSC1,
                deliveredSC2: user.deliveredSC2,
                deliveredPVZ1: user.deliveredPVZ1,
                deliveredPVZ2: user.deliveredPVZ2,
                deliveredKGT1: user.deliveredKGT1,
                deliveredKGT2: user.deliveredKGT2,
                dispatchPVZ1: user.dispatchPVZ1,
                dispatchPVZ2: user.dispatchPVZ2,
                dispatchPVZ3: user.dispatchPVZ3,
                name1: user.name1,
                name2: user.name2,
                name3: user.name3,
                fromName1: user.fromName1,
                fromName2: user.fromName2,
                fromName3: user.fromName3,
                issued1: user.issued1,
                issued2: user.issued2,
                orderAccount: user.orderAccount,
                orderPVZ1: user.orderPVZ1,
                orderPVZ2: user.orderPVZ2,
                orderPVZ3: user.orderPVZ3,
                percentClient1: user.percentClient1,
                percentClient2: user.percentClient2,
                percentClient3: user.percentClient3,
                notation1: user.notation1,
                notation2: user.notation2,
                priceProgram: user.priceProgram,
                purchaseOfGoods: user.purchaseOfGoods,
                sorted: user.sorted,
                paid: user.paid,
                nameOfAction: user.nameOfAction,
                priceSite: user.priceSite,
                prepayment1: user.prepayment1,
                prepayment2: user.prepayment2,
                productLink1: user.productLink1,
                productLink2: user.productLink2,
                productName1: user.productName1,
                productName2: user.productName2,
                dataOurRansom: user.dataOurRansom,
                dataClientRansom: user.dataClientRansom,
                dataDelivery: user.dataDelivery,
                amountFromClient1: user.amountFromClient1,
                amountFromClient2: user.amountFromClient2,
                amountFromClient3: user.amountFromClient3,
                clientLink1: user.clientLink1,
                clientLink2: user.clientLink2,
                clientLink3: user.clientLink3,
                profit1: user.profit1,
                profit2: user.profit2,
                profit3: user.profit3,
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
