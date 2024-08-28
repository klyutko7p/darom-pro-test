import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useMarketplacesStore = defineStore("marketplaces", () => {
  let cachedMarketplaces: any = null;

  async function getMarketplaces() {
    if (cachedMarketplaces) {
      return cachedMarketplaces;
    } else {
      try {
        let { data }: any = await useFetch(
          "/api/marketplaces/get-marketplace",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        cachedMarketplaces = data.value;
        return cachedMarketplaces;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  }

  async function createMarketPlace(name: string) {
    try {
      if (name === "") {
        toast.warning("Название маркетплейса не должно быть пустым");
      } else {
        let data = await useFetch("/api/marketplaces/create-marketplace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name }),
        });
        cachedMarketplaces = null;
        toast.success("Маркетплейс успешно добавлен!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateMarketplace(marketplace: Marketplace) {
    try {
      let data = await useFetch("/api/marketplaces/edit-marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ marketplace: marketplace }),
      });
      cachedMarketplaces = null;
      toast.success("Маркетплейс успешно обновлен!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteMarketplace(id: number) {
    try {
      let data = await useFetch("/api/marketplaces/delete-marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      cachedMarketplaces = null;
      toast.success("Маркетплейс успешно удален!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getMarketplaces,
    createMarketPlace,
    updateMarketplace,
    deleteMarketplace,
  };
});
