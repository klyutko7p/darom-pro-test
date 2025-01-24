import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const usePayrollsStore = defineStore("payrolls", () => {
  let cachedEmployeesRows: IPayroll[] | null = null;

  async function createPayroll(row: IPayroll) {
    try {
      let data = await useFetch("/api/payroll/create-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cachedEmployeesRows = null;
        toast.success("Запись успешно создана!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при создании ");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createPayrolls(rows: IPayroll[]) {
    try {
      let data = await useFetch("/api/payroll/create-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows: rows }),
      });

      if (data.data.value === undefined) {
        cachedEmployeesRows = null;
        toast.success("Записи успешно созданы!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при создании ");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePayrolls(rows: IPayroll[]) {
    try {
      let data = await useFetch("/api/payroll/edit-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows: rows }),
      });

      if (data.data.value === undefined) {
        cachedEmployeesRows = null;
        toast.success("Записи успешно обновлены!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при обновлении ");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getPayrolls() {
    try {
      if (cachedEmployeesRows) {
        return cachedEmployeesRows;
      } else {
        let { data }: any = await useFetch("/api/payroll/get-rows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        cachedEmployeesRows = data.value;
        return cachedEmployeesRows;
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePayroll(row: IPayroll) {
    try {
      let data = await useFetch("/api/payroll/edit-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cachedEmployeesRows = null;
        toast.success("Запись успешно обновлена!");
      } else {
        toast.error("Произошла ошибка при обновлении записи!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      }
    }
  }

  async function deletePayroll(id: number) {
    try {
      let data = await useFetch("/api/payroll/delete-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      if (data.data.value === undefined) {
        cachedEmployeesRows = null;
        toast.success("Запись успешно удалена!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    updatePayroll,
    getPayrolls,
    createPayroll,
    deletePayroll,
    createPayrolls,
    updatePayrolls,
  };
});
