import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    sumOfRejection: any;
}


export default defineEventHandler(async (event) => {
    try {
        const { sumOfRejection } = await readBody<IRequestBody>(event);

        const updateSum = await prisma.sumOfRejection.update({
            where: {
                id: sumOfRejection.id,
            },
            data: {
                value: +sumOfRejection.value,
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
