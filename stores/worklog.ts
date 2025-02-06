import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import CryptoJS from "crypto-js";
const toast = useToast();

export const useWorklogStore = defineStore("worklog", () => {
  const config = useRuntimeConfig();
  const encryptionKey = config.public.encryptionKeyFourssan as string;

  async function createWorklogs(usersId: number[], worklogData: WorkLog) {
    try {
      let data = await useFetch("/api/worklogs/create-worklogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usersId, worklogData }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Строки успешно созданы!");
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getWorklogs() {
    try {
      let { data }: any = await useFetch("/api/worklogs/get-worklogs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const bytes = CryptoJS.AES.decrypt(data.value, encryptionKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      return decryptedData;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getWorklogsByUser(userId: number) {
    try {
      let { data }: any = await useFetch("/api/worklogs/get-worklogs-by-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const bytes = CryptoJS.AES.decrypt(data.value, encryptionKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      return decryptedData;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateWorklog(id: number, day: number, hours: number) {
    try {
      let data = await useFetch("/api/worklogs/update-worklog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, day, hours }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePayroll(
    name: string,
    year: number,
    monthIndex: number,
    hours: number,
    pvz: string,
    company: string
  ) {
    try {
      let data = await useFetch("/api/payroll/update-payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, year, monthIndex, hours, pvz, company }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRowsByName(name: string) {
    try {
      let { data }: any = await useFetch("/api/payroll/get-rows-by-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRows() {
    try {
      let { data }: any = await useFetch("/api/payroll/get-rows", {
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

  async function deleteWorklog(id: number) {
    try {
      let data = await useFetch("/api/worklogs/delete-worklog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Строка успешно удалена!");
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
    createWorklogs,
    getWorklogs,
    getWorklogsByUser,
    updateWorklog,
    deleteWorklog,
    updatePayroll,
    getRowsByName,
    getRows,
  };
});
