import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: [
                {
                    created_at: 'asc'
                },
            ]
        });
        return clients;
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
