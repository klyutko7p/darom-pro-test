import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    link: string;
    flag: string;
}

export default defineEventHandler(async (event) => {
    try {
        const { link, flag } = await readBody<IRequestBody>(event);

        if (flag === 'OurRansom') {
            const rows = await prisma.ourRansom.findMany({
                where: {
                    clientLink1: link,
                },
                orderBy: [
                    {
                        deliveredPVZ: 'asc'
                    },
                    {
                        deliveredSC: 'asc'
                    },
                ]
            });
            return rows;
        } else if (flag === 'ClientRansom') {
            const rows = await prisma.clientRansom.findMany({
                where: {
                    clientLink2: link,
                },
                orderBy: [
                    {
                        deliveredPVZ: 'asc'
                    },
                    {
                        deliveredSC: 'asc'
                    },
                ]
            });
            return rows;
        } else if (flag === 'Delivery') {
            const rows = await prisma.delivery.findMany({
                where: {
                    clientLink3: link,
                },
                orderBy: {
                    created_at: 'desc',   
                }
            });
            return rows;
        }

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
