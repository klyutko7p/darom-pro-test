import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    fromName: string;
}

export default defineEventHandler(async (event) => {
    try {
        const { fromName } = await readBody<IRequestBody>(event);
        const rows = await prisma.phoneNumber.findFirst({
            where: {
                number: fromName,
            },
            orderBy: {
                id: 'desc',
            }
        });
        return rows;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }

});
