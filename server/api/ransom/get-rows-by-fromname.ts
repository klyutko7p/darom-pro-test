import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    fromName: string;
    cell: string;
    flag: string;
}

export default defineEventHandler(async (event) => {
    try {
        const { fromName, cell, flag } = await readBody<IRequestBody>(event);

        if (flag === 'OurRansom') {
            const rows = await prisma.ourRansom.findMany({
                where: {
                    fromName: fromName,
                    cell: cell,
                },
                orderBy: [
                    {
                        created_at: 'desc'
                    },
                ]
            });
            return rows;
        } else if (flag === 'ClientRansom') {
            const rows = await prisma.clientRansom.findMany({
                where: {
                    fromName: fromName,
                    cell: cell,
                },
                orderBy: [
                    {
                        created_at: 'desc'
                    },
                ]
            });
            return rows;
        }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
