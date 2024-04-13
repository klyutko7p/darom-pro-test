import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    flag: string
}

export default defineEventHandler(async (event) => {
    try {
        let { flag } = await readBody<IRequestBody>(event);
        const startDate = new Date('2024-03-21T00:00:00Z');

        if (flag === 'OurRansom') {
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
                    issued: {
                        gt: startDate, 
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            return rows;
        } else if (flag === 'ClientRansom') {
            const rows = await prisma.clientRansom.findMany({
                orderBy: {
                    created_at: 'desc',
                }
            });
            return rows;
        } else if (flag === 'Delivery') {
            const rows = await prisma.delivery.findMany({
                orderBy: {
                    created_at: 'desc',
                }
            });
            return rows;
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }

});
