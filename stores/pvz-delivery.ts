import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const usePVZDeliveryStore = defineStore("pvz-delivery", () => {
  let cachedPVZ: any = null;

  async function getPVZ() {
    if (cachedPVZ) {
      return cachedPVZ;
    } else {
      try {
        let { data }: any = await useFetch(
          "/api/pvz-delivery/get-pvz-delivery",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        cachedPVZ = data.value;
        return cachedPVZ;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  }

  async function createPVZ(name: string, address: string) {
    try {
      if (name === "") {
        toast.warning("Название ПВЗ не должно быть пустым");
      } else {
        let data = await useFetch("/api/pvz-delivery/create-pvz-delivery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name, address: address }),
        });
        cachedPVZ = null;
        toast.success("ПВЗ успешно добавлено!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePVZ(pvz: PVZ) {
    try {
      let data = await useFetch("/api/pvz-delivery/edit-pvz-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pvz: pvz }),
      });
      cachedPVZ = null;
      toast.success("ПВЗ успешно обновлено!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deletePVZ(id: number) {
    try {
      let data = await useFetch("/api/pvz-delivery/delete-pvz-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      cachedPVZ = null;
      toast.success("ПВЗ успешно удалено!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return { getPVZ, createPVZ, updatePVZ, deletePVZ };
});
