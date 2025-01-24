import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useMarkersStore = defineStore("markers", () => {
  let cashedMarkers: any = null;

  async function getMarkers() {
    if (cashedMarkers) {
      return cashedMarkers;
    } else {
      try {
        let { data }: any = await useFetch("/api/markers/get-markers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        cashedMarkers = data.value;
        return cashedMarkers;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  }

  async function createMarker(
    coordinates: number[],
    type: string,
    username: string,
    notation: string
  ) {
    try {
      let data = await useFetch("/api/markers/create-marker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coordinates, type, username, notation }),
      });
      cashedMarkers = null;
      toast.success("Маркер успешно добавлен!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteMarker(id: number) {
    try {
      let data = await useFetch("/api/markers/delete-marker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      cashedMarkers = null;
      toast.success("Маркер успешно удален!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getMarkers,
    createMarker,
    deleteMarker,
  };
});
