import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useAutosStore = defineStore("auto", () => {
  let allStateAutos: string[] = ["На складе", "Установлено"];

  function getAllStateAutos() {
    return allStateAutos;
  }

  async function getAutos() {
    try {
      let { data }: any = await useFetch("/api/autos/get-autos", {
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

  async function getAutoTypes() {
    try {
      let { data }: any = await useFetch("/api/autos/get-all-types", {
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

  async function getAuto(id: number) {
    try {
      let { data }: any = await useFetch("/api/autos/get-auto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getDecommissionedAutos() {
    try {
      let { data }: any = await useFetch(
        "/api/autos/get-decommissioned-autos",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createAuto(auto: AutoRow) {
    try {
      let data = await useFetch("/api/autos/create-auto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auto }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Строка успешно создана!");
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateAuto(auto: AutoRow) {
    try {
      let data = await useFetch("/api/autos/update-auto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auto }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Строка успешно изменена!");
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateStateRows(
    idArray: number[],
    flag: string,
    userId: number
  ) {
    try {
      let data = await useFetch("/api/autos/update-state-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idArray,
          flag,
          userId,
        }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Строка успешно изменена!");
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  const getUniqueNonEmptyValues = (
    rows: AutoRow[],
    fieldName: keyof AutoRow
  ): string[] => {
    const uniqueNonEmptyValues = new Set<string>();
    rows.forEach((row) => {
      const value = row[fieldName] as any;
      if (value !== "" && value !== null && value !== undefined) {
        uniqueNonEmptyValues.add(value);
      }
    });
    return Array.from(uniqueNonEmptyValues);
  };

  const getUniqueNonEmptyValuesDecommissioned = (
    rows: DecommissionedAutoRow[],
    fieldName: keyof DecommissionedAutoRow
  ): string[] => {
    const uniqueNonEmptyValues = new Set<string>();
    rows.forEach((row) => {
      const value = row[fieldName] as any;
      if (value !== "" && value !== null && value !== undefined) {
        uniqueNonEmptyValues.add(value);
      }
    });
    return Array.from(uniqueNonEmptyValues);
  };

  async function updateTypeRows(
    idArray: number[],
    autoTypeId: number,
    userId: number
  ) {
    try {
      if (idArray.length) {
        let data = await useFetch("/api/autos/update-type-rows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idArray,
            autoTypeId,
            userId,
          }),
        });
        if (
          data.data.value &&
          "success" in data.data.value &&
          data.data.value.success
        ) {
          toast.success("ПВЗ успешно изменено!");
        } else {
          toast.error("Произошла ошибка!");
        }
      } else {
        toast.error("Произошла ошибка. Выделите нужные записи");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateAutos(rows: AutoRow[]) {
    try {
      let data = await useFetch("/api/autos/update-autos", {
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

  async function updateDecommissionedRows(
    idArray: number[],
    reason: string,
    userId: number
  ) {
    try {
      let data = await useFetch("/api/autos/update-decommissioned-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idArray,
          reason,
          userId,
        }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Строка успешно списана!");
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteDecommissionedAuto(id: number) {
    try {
      let data = await useFetch("/api/autos/delete-decommissioned-auto", {
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
        toast.success("Списанное авто успешно удалено!");
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
    getAutos,
    createAuto,
    updateAuto,
    getAllStateAutos,
    updateStateRows,
    updateTypeRows,
    updateDecommissionedRows,
    getDecommissionedAutos,
    deleteDecommissionedAuto,
    getUniqueNonEmptyValues,
    getUniqueNonEmptyValuesDecommissioned,
    updateAutos,
    getAuto,
    getAutoTypes,
  };
});
