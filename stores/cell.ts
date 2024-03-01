import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast()

interface CellDispatchPair {
    cell: string;
    dispatchPVZ: string;
}

export const useCellsStore = defineStore("cells", () => {

    let cachesCells: any = null;

    async function getCells() {
        if (cachesCells) {
            return cachesCells;
        } else {
            try {
                let { data }: any = await useFetch('/api/cells/get-cells', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                cachesCells = data.value;
                return cachesCells;
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                }
            }
        }
    }

    async function updateCell(cell: Cell, status: string, fromName: string) {
        try {
            let data = await useFetch('/api/cells/cell-update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cell: cell, statusString: status, fromNameString: fromName }),
            })
            cachesCells = null;
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    async function updateCellsStatus(ransomRows: any[]): Promise<any[]> {
        try {
            const filteredData = ransomRows.filter(item => item.cell && !item.cell.includes("-") && item.dispatchPVZ !== 'НаДом');

            const groupedData: { [dispatchPVZ: string]: { [cell: string]: any[] } } = {};

            filteredData.forEach(item => {
                const dispatchPVZ = item.dispatchPVZ;
                const cell = item.cell;

                if (!groupedData[dispatchPVZ]) {
                    groupedData[dispatchPVZ] = {};
                }

                if (!groupedData[dispatchPVZ][cell]) {
                    groupedData[dispatchPVZ][cell] = [];
                }

                groupedData[dispatchPVZ][cell].push(item);
            });

            const freeCells: { cell: string, dispatchPVZ: string }[] = [];

            for (const dispatchPVZ in groupedData) {
                for (const cell in groupedData[dispatchPVZ]) {
                    const allIssuedNotNull = groupedData[dispatchPVZ][cell].every(item => item.issued !== null);
                    if (allIssuedNotNull) {
                        freeCells.push({ cell, dispatchPVZ });
                    }
                }
            }

            return freeCells;
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
            throw error;
        }
    }


    return { getCells, updateCell, updateCellsStatus }
})