import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    sortingCenter: SortingCenter;
}


export default defineEventHandler(async (event) => {
    try {
        const { sortingCenter } = await readBody<IRequestBody>(event);

        const updateSortingCenter = await prisma.sortingCenterDelivery.update({
            where: {
                id: sortingCenter.id,
            },
            data: {
                name: sortingCenter.name,
                address: sortingCenter.address,
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
