import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    row: IOurRansom | IClientRansom;
    flag: string;
    flagRansom: string;
    username: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { row, flag, flagRansom, username } = await readBody<IRequestBody>(event);

        let updateField;

        switch (flag) {
            case 'SC':
                updateField = 'deliveredSC';
                break;
            case 'PVZ':
                updateField = 'deliveredPVZ';
                break;
            case 'issued':
                updateField = 'issued';
                break;
            case 'sorted':
                updateField = 'sorted';
                break;
            case 'paid':
                updateField = 'paid';
                break;
            default:
                throw new Error(`Unsupported flag: ${flag}`);
        }

        if (flagRansom === 'OurRansom') {
            const updateRow = await prisma.ourRansom.update({
                where: {
                    id: row.id,
                },
                data: {
                    [updateField]: new Date(),
                    updatedUser: username,
                },
            });
        } else if (flagRansom === 'ClientRansom') {
            const updateRow = await prisma.clientRansom.update({
                where: {
                    id: row.id,
                },
                data: {
                    [updateField]: new Date(),
                    updatedUser: username,
                },
            });
        } else if (flagRansom === 'Delivery') {
            const updateRow = await prisma.delivery.update({
                where: {
                    id: row.id,
                },
                data: {
                    [updateField]: new Date(),
                    updatedUser: username,
                },
            });
        }


    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
});

