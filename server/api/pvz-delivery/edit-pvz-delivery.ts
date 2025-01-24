import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    pvz: PVZ;
}


export default defineEventHandler(async (event) => {
    try {
        const { pvz } = await readBody<IRequestBody>(event);

        const updatePVZ = await prisma.pVZDelivery.update({
            where: {
                id: pvz.id,
            },
            data: {
                name: pvz.name,
                address: pvz.address
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
