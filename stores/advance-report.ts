import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useAdvanceReports = defineStore("advance-reports", () => {
  let cachedAdvanceReportRows: IAdvanceReport[] | null = null;

  async function createAdvanceReport(row: IAdvanceReport, username: string) {
    try {
      if (row.issuedUser === undefined) row.issuedUser = "";
      if (row.PVZ === undefined) row.PVZ = "";
      if (row.issuedUser === undefined) row.issuedUser = "";
      if (row.expenditure === undefined) row.expenditure = "0";
      if (row.typeOfExpenditure === undefined) row.typeOfExpenditure = "";
      if (row.notation === undefined) row.notation = "";
      if (row.company === undefined) row.company = "";
      if (row.type === undefined) row.type = "Нал";

      let data = await useFetch("/api/advance-report/create-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row, username: username }),
      });

      if (data.data.value === undefined) {
        cachedAdvanceReportRows = null;
        toast.success("Документ успешно создан!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при создании записи");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createAdvanceReports(rows: IAdvanceReport[]) {
    try {
      let data = await useFetch("/api/advance-report/create-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows: rows }),
      });

      if (data.data.value === undefined) {
        cachedAdvanceReportRows = null;
        toast.success("Документы успешно созданы!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при создании записей");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getAdvancedReports() {
    try {
      if (cachedAdvanceReportRows) {
        return cachedAdvanceReportRows;
      } else {
        let { data }: any = await useFetch("/api/advance-report/get-rows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        cachedAdvanceReportRows = data.value;
        return cachedAdvanceReportRows;
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateAdvanceReport(row: IAdvanceReport) {
    try {
      if (row.issuedUser === undefined) row.issuedUser = "";
      if (row.PVZ === undefined) row.PVZ = "";
      if (row.issuedUser === undefined) row.issuedUser = "";
      if (row.expenditure === undefined) row.expenditure = "0";
      if (row.typeOfExpenditure === undefined) row.typeOfExpenditure = "";
      if (row.notation === undefined) row.notation = "";
      if (row.company === undefined) row.company = "";
      if (row.type === undefined) row.type = "Нал";

      let data = await useFetch("/api/advance-report/edit-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cachedAdvanceReportRows = null;
        toast.success("Документ успешно обновлен!");
      } else {
        toast.error("Произошла ошибка при обновлении документа!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      }
    }
  }

  async function updateDeliveryStatus(row: IAdvanceReport) {
    try {
      let data = await useFetch("/api/advance-report/update-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cachedAdvanceReportRows = null;
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

  const getUniqueNonEmptyValues = (
    rows: IAdvanceReport[],
    fieldName: keyof IAdvanceReport
  ): string[] => {
    const uniqueNonEmptyValues = new Set<string>();
    rows.forEach((row) => {
      const value = row[fieldName];
      if (value !== "" && value !== null && value !== undefined) {
        uniqueNonEmptyValues.add(value);
      }
    });
    return Array.from(uniqueNonEmptyValues);
  };

  async function deleteRow(id: number) {
    try {
      let data = await useFetch("/api/advance-report/delete-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (data.data.value === undefined) {
        cachedAdvanceReportRows = null;
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
    updateAdvanceReport,
    getAdvancedReports,
    createAdvanceReport,
    updateDeliveryStatus,
    getUniqueNonEmptyValues,
    createAdvanceReports,
    deleteRow,
  };
});
