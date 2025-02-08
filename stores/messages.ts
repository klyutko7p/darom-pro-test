import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useChatsStore = defineStore("chats", () => {
  async function getMessages() {
    try {
      let { data }: any = await useFetch("/api/chat/get-messages", {
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

  async function getThreadById(id: number) {
    try {
      let { data }: any = await useFetch("/api/chat/get-thread-by-id", {
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

  async function deleteThread(id: number) {
    try {
      let data = await useFetch("/api/chat/delete-thread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      toast.success("Сообщение успешно удалено!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    deleteThread,
    getMessages,
    getThreadById,
  };
});
