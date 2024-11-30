import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    orderAccount: OrderAccount;
}


export default defineEventHandler(async (event) => {
    try {
        const { orderAccount } = await readBody<IRequestBody>(event);

        const updateOrderAccount = await prisma.orderAccount.update({
            where: {
                id: orderAccount.id,
            },
            data: {
                name: orderAccount.name,
                active: orderAccount.active,
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
