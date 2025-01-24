import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useBoxesStore = defineStore("boxes", () => {
  async function getBoxes() {
    try {
      let { data }: any = await useFetch("/api/box/get-boxes", {
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

  async function getBoxById(id: number) {
    try {
      let { data }: any = await useFetch("/api/box/get-box-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createBox(box: Box) {
    try {
      let { data }: any = await useFetch("/api/box/create-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ box }),
      });
      toast.success("Коробка успешно добавлена!");

      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateBox(box: Box) {
    try {
      let data = await useFetch("/api/box/edit-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ box }),
      });
      toast.success("Коробка успешно обновлена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteBox(id: number) {
    try {
      let data = await useFetch("/api/box/delete-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      toast.success("Коробка успешно удалена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getBoxes,
    createBox,
    updateBox,
    deleteBox,
    getBoxById,
  };
});
