import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useTicketsStore = defineStore("tickets", () => {
  async function getClientTickets(clientId: number) {
    try {
      let { data }: any = await useFetch(
        "/api/client-tickets/get-client-tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientId }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createTicket(clientId: number, uniqueCode: string) {
    try {
      let data = await useFetch("/api/client-tickets/create-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId, uniqueCode }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success(
          "Вы успешно получили билетик! Можете посмотреть свои билетики в списке «Мои билетики»"
        );
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getClientTickets,
    createTicket,
  };
});
