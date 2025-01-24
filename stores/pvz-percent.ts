import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const usePVZPercentStore = defineStore("pvz-percent", () => {
  async function getPVZ() {
    try {
      let { data }: any = await useFetch("/api/pvz-percent/get-pvz", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createPVZ(pvzPercent: IPVZPercent) {
    try {
      let data = await useFetch("/api/pvz-percent/create-pvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pvzPercent }),
      });
      toast.success("Проценты у ПВЗ успешно добавлены!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePVZ(pvzPercent: IPVZPercent) {
    try {
      let data = await useFetch("/api/pvz-percent/edit-pvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pvzPercent }),
      });
      toast.success("ПВЗ успешно обновлено!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deletePVZ(id: number) {
    try {
      let data = await useFetch("/api/pvz-percent/delete-pvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      toast.success("Проценты ПВЗ успешно удалены!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePVZPercents(rows: IPVZPercent[]) {
    try {
      let data = await useFetch("/api/pvz-percent/update-pvzs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return { getPVZ, createPVZ, updatePVZ, deletePVZ, updatePVZPercents };
});
