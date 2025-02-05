import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import * as msgpack from "@msgpack/msgpack";

const toast = useToast();

export const useAdvanceReports = defineStore("advance-reports", () => {
  let cachedAdvanceReportRows: IAdvanceReport[] | null = null;
  let cachedAdvanceReportRowsSidebar: IAdvanceReport[] | null = null;
  let pvz: string[] = [
    "Ряженое",
    "Алексеевка",
    "Латоново",
    "Надежда",
    "Александровка",
    "Новониколаевка",
    "Политотдельское",
    "Мещерино",
    "Коломенское ЯМ",
    "Коломенское WB",
    "Бессоново WB",
    "Бессоново OZ",
    "ПВЗ_1",
    "ПВЗ_2",
    "ПВЗ_3",
    "ПВЗ_4",
    "ППВЗ_5",
    "ППВЗ_6",
    "ППВЗ_7",
    "ПВЗ_8",
    "ППВЗ_9",
    "ПВЗ_10",
    "ПВЗ_11",
    "ППВЗ_12",
    "ПВЗ_13",
    "ПВЗ_14",
    "Магазин",
    "Офис",
    "НаДом",
  ];

  function getPVZ() {
    return pvz;
  }

  async function createAdvanceReport(row: IAdvanceReport, username: string) {
    try {
      if (row.issuedUser === undefined) row.issuedUser = "";
      if (row.PVZ === undefined) row.PVZ = "";
      if (row.issuedUser === undefined) row.issuedUser = "";
      if (row.expenditure === undefined) row.expenditure = 0;
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

  async function getAdvancedReports(user: User) {
    try {
      if (cachedAdvanceReportRows) {
        return cachedAdvanceReportRows;
      } else {
        let response = await fetch(
          "/api/advance-report/get-rows",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: JSON.stringify({ user }),
          }
        );

        const arrayBuffer = await response.arrayBuffer();
        const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
        return unpacked.map(mapBackToOriginalFields);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  function mapBackToOriginalFields(row: any) {
    const originalRow = {} as IOurRansom;

    if (row.id !== undefined) originalRow.id = row.id;
    if (row.dpz !== undefined) originalRow.PVZ = row.dpz;
    if (row.da !== undefined) originalRow.date = row.da;
    if (row.iu !== undefined) originalRow.issuedUser = row.iu;
    if (row.ex !== undefined) originalRow.expenditure = row.ex;
    if (row.te !== undefined) originalRow.typeOfExpenditure = row.te;
    if (row.nt !== undefined) originalRow.notation = row.nt;
    if (row.cm !== undefined) originalRow.company = row.cm;
    if (row.sd !== undefined) originalRow.supportingDocuments = row.sd;
    if (row.ty !== undefined) originalRow.type = row.ty;
    if (row.cu !== undefined) originalRow.createdUser = row.cu;
    if (row.r !== undefined) originalRow.received = row.r;
    if (row.c !== undefined) originalRow.created_at = row.c;

    return originalRow;
  }

  async function getAdvancedReportsForSidebar() {
    try {
      if (cachedAdvanceReportRowsSidebar) {
        return cachedAdvanceReportRowsSidebar;
      } else {
        let { data }: any = await useFetch(
          "/api/advance-report/get-rows-for-sidebar",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        cachedAdvanceReportRowsSidebar = data.value;
        return cachedAdvanceReportRowsSidebar;
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
      if (row.expenditure === undefined) row.expenditure = 0;
      if (row.typeOfExpenditure === undefined) row.typeOfExpenditure = "";
      if (row.notation === undefined) row.notation = "";
      if (row.company === undefined) row.company = "";
      if (row.type === undefined) row.type = "Нал";

      let data = await useFetch("/api/advance-report/edit-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row }),
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

  async function getUniqueNonEmptyValuesQuery(fieldName: string) {
    try {
      let response = await fetch("/api/advance-report/get-unique-values", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: JSON.stringify({ fieldName }),
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
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
    getPVZ,
    getAdvancedReportsForSidebar,
    getUniqueNonEmptyValuesQuery,
  };
});
