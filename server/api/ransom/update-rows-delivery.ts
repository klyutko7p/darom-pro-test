import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    idArray: number[];
    flag: string;
    flagRansom: string;
}

function getAdditionally(status: string) {
    if (status === 'additionally') {
        return 'Оплачено онлайн'
    } else if (status === 'additionally1') {
        return 'Отказ клиент'
    } else if (status === 'additionally2') {
        return 'Отказ брак'
    }
}


export default defineEventHandler(async (event) => {
    try {
        const { idArray, flag, flagRansom } = await readBody<IRequestBody>(event);

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
            case 'additionally':
                updateField = 'additionally'
            case 'additionally1':
                updateField = 'additionally'
            case 'additionally2':
                updateField = 'additionally'
                break;
            default:
                throw new Error(`Unsupported flag: ${flag}`);
        }

        if (flagRansom === 'OurRansom' && updateField !== 'additionally') {
            const updateRow = await prisma.ourRansom.updateMany({
                where: {
                    id: {
                        in: idArray,
                    },
                },
                data: {
                    [updateField]: new Date(),
                },
            });
        } else if ((flagRansom === 'OurRansom' && updateField === 'additionally')) {
            const updateRow = await prisma.ourRansom.updateMany({
                where: {
                    id: {
                        in: idArray,
                    },
                },
                data: {
                    additionally: getAdditionally(flag),
                },
            });
        } else if (flagRansom === 'ClientRansom') {
            const updateRow = await prisma.clientRansom.updateMany({
                where: {
                    id: {
                        in: idArray,
                    },
                },
                data: {
                    [updateField]: new Date(),
                },
            });
        } else if (flagRansom === 'Delivery') {
            const updateRow = await prisma.delivery.updateMany({
                where: {
                    id: {
                        in: idArray,
                    },
                },
                data: {
                    [updateField]: new Date(),
                },
            });
        }



    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }
});

