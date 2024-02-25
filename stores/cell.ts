import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast()

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
            console.log(data.value);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }
    

    return { getCells, updateCell }
})