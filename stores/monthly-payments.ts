import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const usePaymentsStore = defineStore("payment", () => {
  
  async function getPayments() {
    try {
      let { data }: any = await useFetch("/api/payments/get-payments", {
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

  async function createPayment(payment: MonthlyPayment) {
    try {
      let data = await useFetch("/api/payments/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment }),
      });
      toast.success("Платёж успешно добавлен!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePayment(payment: MonthlyPayment) {
    try {
      let data = await useFetch("/api/payments/edit-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment }),
      });
      toast.success("Платёж успешно обновлен!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deletePayment(id: number) {
    try {
      let data = await useFetch("/api/payments/delete-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      toast.success("Платёж успешно удален!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePayments(payments: MonthlyPayment[]) {
    try {
      let data = await useFetch("/api/payments/update-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payments }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getPayments,
    createPayment,
    updatePayment,
    deletePayment,
    updatePayments,
  };
});
