import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useTasksStore = defineStore("tasks", () => {
  async function getTasks() {
    try {
      let { data }: any = await useFetch("/api/tasks/get-tasks", {
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

  async function createTask(task: Task) {
    try {
      let data = await useFetch("/api/tasks/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });
      toast.success("Задача успешно добавлена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateTask(task: Task) {
    try {
      let data = await useFetch("/api/tasks/edit-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });
      toast.success("Задача успешно обновлена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteTask(id: number) {
    try {
      let data = await useFetch("/api/tasks/delete-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      toast.success("Задача успешно удалена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateStatus(task: Task, flag: string, username: string) {
    try {
      let data = await useFetch("/api/tasks/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task, flag, username }),
      });

      if (data.data.value === undefined) {
        toast.success("Статус успешно обновлен!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      }
    }
  }

  async function deleteIssuedRows() {
    try {
      let data = await useFetch("/api/tasks/delete-issued-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateTasks(rows: Task[]) {
    try {
      let data = await useFetch("/api/tasks/update-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getTasks,
    createTask,
    updateTask,
    updateStatus,
    updateTasks,
    deleteTask,
    deleteIssuedRows,
  };
});
