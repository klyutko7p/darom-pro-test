import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useBanksStore = defineStore("banks", () => {
  async function getBanks() {
    try {
      let { data }: any = await useFetch("/api/bank/get-banks", {
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

  async function createBank(bank: Bank) {
    try {
      let data = await useFetch("/api/bank/create-bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bank }),
      });
      toast.success("Банк успешно добавлен!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateBank(bank: Bank) {
    try {
      let data = await useFetch("/api/bank/edit-bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bank }),
      });
      toast.success("Банк успешно обновлен!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateBanks(banks: Bank[]) {
    try {
      let data = await useFetch("/api/bank/update-banks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banks }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getTransactions() {
    try {
      let { data }: any = await useFetch("/api/transaction/get-transactions", {
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

  async function createTransaction(transaction: Transaction) {
    try {
      let data = await useFetch("/api/transaction/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction }),
      });
      toast.success("Транзакция успешно выполнена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateTransaction(transaction: Transaction) {
    try {
      let data = await useFetch("/api/transaction/edit-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction }),
      });
      toast.success("Транзакция успешно обновлена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteTransaction(id: number) {
    try {
      let data = await useFetch("/api/transaction/delete-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      toast.success("Транзакция успешно удалена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getBanks,
    createBank,
    updateBank,
    updateBanks,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
});
