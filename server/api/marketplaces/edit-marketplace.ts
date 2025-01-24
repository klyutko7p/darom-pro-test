import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    marketplace: Marketplace;
}


export default defineEventHandler(async (event) => {
    try {
        const { marketplace } = await readBody<IRequestBody>(event);

        const updateMarketplace = await prisma.marketplace.update({
            where: {
                id: marketplace.id,
            },
            data: {
                name: marketplace.name,
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
