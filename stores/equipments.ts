import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useEquipmentsStore = defineStore("equipments", () => {
  let allStateEquipments: string[] = [
    "Исправное",
    "Требуется ремонт",
    "Неисправное",
  ];

  function getAllStateEquipments() {
    return allStateEquipments;
  }

  async function getEquipments() {
    try {
      let { data }: any = await useFetch("/api/equipments/get-equipments", {
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

  async function getEquipment(id: number) {
    try {
      let { data }: any = await useFetch("/api/equipments/get-equipment", {
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

  async function getDecommissionedEquipments() {
    try {
      let { data }: any = await useFetch(
        "/api/equipments/get-decommissioned-equipments",
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

  async function createEquipment(equipment: IEquipmentRow) {
    try {
      let data = await useFetch("/api/equipments/create-equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ equipment }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Оборудование успешно создано!");
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateEquipment(equipment: IEquipmentRow) {
    try {
      let data = await useFetch("/api/equipments/update-equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ equipment }),
      });
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Оборудование успешно изменено!");
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
      let data = await useFetch("/api/equipments/update-state-rows", {
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
        toast.success("Состояние успешно изменено!");
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
    rows: IEquipmentRow[],
    fieldName: keyof IEquipmentRow
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
    rows: IDecommissionedEquipmentRow[],
    fieldName: keyof IDecommissionedEquipmentRow
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

  async function updatePVZRows(
    idArray: number[],
    pvzId: number,
    userId: number
  ) {
    try {
      if (idArray.length) {
        let data = await useFetch("/api/equipments/update-pvz-rows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idArray,
            pvzId,
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

  async function updateEquipments(rows: IEquipmentRow[]) {
    try {
      let data = await useFetch("/api/equipments/update-equipments", {
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
      let data = await useFetch("/api/equipments/update-decommissioned-rows", {
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
        toast.success("Оборудование успешно списано!");
      } else {
        toast.error("Произошла ошибка!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteDecommissionedEquipment(id: number) {
    try {
      let data = await useFetch(
        "/api/equipments/delete-decommissioned-equipment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );
      if (
        data.data.value &&
        "success" in data.data.value &&
        data.data.value.success
      ) {
        toast.success("Списанное оборудование успешно удалено!");
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
    getEquipments,
    createEquipment,
    updateEquipment,
    getAllStateEquipments,
    updateStateRows,
    updatePVZRows,
    updateDecommissionedRows,
    getDecommissionedEquipments,
    deleteDecommissionedEquipment,
    getUniqueNonEmptyValues,
    getUniqueNonEmptyValuesDecommissioned,
    updateEquipments,
    getEquipment,
  };
});
