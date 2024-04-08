import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useTasksStore = defineStore("tasks", () => {
  let cachedTasks: any = null;

  async function getTasks() {
    if (cachedTasks) {
      return cachedTasks;
    } else {
      try {
        let { data }: any = await useFetch("/api/tasks/get-tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        cachedTasks = data.value;
        return cachedTasks;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
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
      cachedTasks = null;
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
      cachedTasks = null;
      toast.success("Задача успешно обновлена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateStatus(task: Task, flag: string) {
    try {
      let data = await useFetch("/api/tasks/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task, flag }),
      });

      if (data.data.value === undefined) {
        cachedTasks = null;
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

  return { getTasks, createTask, updateTask, updateStatus };
});
