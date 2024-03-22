import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    rows: IAdvanceReport[];
}

export default defineEventHandler(async (event) => {
    try {
        let { rows } = await readBody<IRequestBody>(event);
        const createdRows = await prisma.advanceReport.createMany({
            data: rows.map(row => ({
                id: row.id,
                PVZ: row.PVZ,
                notation: row.notation,
                company: row.company,
                expenditure: row.expenditure,
                typeOfExpenditure: row.typeOfExpenditure,
                type: row.type,
                issuedUser: row.issuedUser,
                date: row.date ? new Date(row.date).toISOString() : null,
                supportingDocuments: row.supportingDocuments,
                createdUser: row.createdUser,
                received: row.received ? new Date(row.received).toISOString() : null,
            }))
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }
});
