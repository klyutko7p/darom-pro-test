import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useQRStore = defineStore("qr", () => {
  async function createQRCode(amount: number, notation: string) {
    try {
      let { data } = await useFetch("/api/qr/create-dynamic-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, notation }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getQRCode(qrcId: string) {
    try {
      let { data } = await useFetch("/api/qr/get-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrcId }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getPaymentStatusQR(qrcId: string) {
    try {
      let { data } = await useFetch("/api/qr/check-status-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrcId }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return { createQRCode, getQRCode, getPaymentStatusQR };
});
