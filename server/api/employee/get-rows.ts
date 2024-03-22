import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export default defineEventHandler(async (event) => {
    try {
        const rows = await prisma.employee.findMany({
            orderBy: [
                {
                    PVZ: 'asc',
                },
                {
                    fullname: 'asc',
                }
            ]
        });
        return rows;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }

});
