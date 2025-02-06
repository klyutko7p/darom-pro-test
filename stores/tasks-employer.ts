import Cookies from "js-cookie";
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import CryptoJS from "crypto-js";
const toast = useToast();
import { useRuntimeConfig } from "#imports";

export const useTasksEmployerStore = defineStore("tasks-employer", () => {
  const runtimeConfig = useRuntimeConfig();
  const encryptionKey = runtimeConfig.public.encryptionKeyFourssan as string;

  let userData = {} as User;

  async function createTask(task: TaskEmployer) {
    try {
      let data = await useFetch("/api/tasks-employer/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getTasks() {
    try {
      let { data }: any = await useFetch("/api/tasks-employer/get-tasks", {
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

  async function getTasksByUser(userId: number) {
    try {
      let { data }: any = await useFetch(
        "/api/tasks-employer/get-tasks-by-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const bytes = CryptoJS.AES.decrypt(data.value, encryptionKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      return decryptedData;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateTask(task: TaskEmployer, typeSelectedTasks: number) {
    try {
      let data = await useFetch("/api/tasks-employer/edit-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task, typeSelectedTasks }),
      });
      toast.success("Успешно обновлено!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateTaskStatus(taskId: number, isCompleted: boolean) {
    try {
      let data = await useFetch("/api/tasks-employer/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId, isCompleted }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteTask(id: number, typeSelectedTasks: number) {
    try {
      let data = await useFetch("/api/tasks-employer/delete-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, typeSelectedTasks }),
      });

      toast.success("Успешно удалено!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    userData,
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByUser,
  };
});
