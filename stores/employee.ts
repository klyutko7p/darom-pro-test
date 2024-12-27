import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useEmployeesStore = defineStore("employees", () => {
  let cachedEmployeesRows: IEmployee[] | null = null;

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
    "Новоандриановка",
    "ПВЗ_1",
    "ПВЗ_2",
    "ПВЗ_3",
    "ПВЗ_4",
    "ППВЗ_5",
    "ППВЗ_7",
    "ПВЗ_8",
    "ППВЗ_9",
    "ПВЗ_10",
    "Офис",
    "НаДом",
  ];

  let companies: string[] = [
    "W/O/Я start",
    "Darom.pro",
    "Сортировка",
    "Доставка",
  ];

  let jobs: string[] = [
    "Руководитель проекта",
    "Управляющий ПВЗ",
    "Сотрудник ПВЗ",
    "Секретарь",
    "Директор",
    "Сортировщик",
    "Служба поддержки",
    "Светлана",
    "Водитель",
  ];

  let banks: string[] = [
    "тинькофф",
    "сбер",
    "почтабанк",
    "озон",
    "яндекс банк",
    "альфа банк",
    "центр инвест",
    "ВТБ",
    "БКС банк",
    "Райфайзен",
  ];

  function getPVZ() {
    return pvz;
  }

  function getCompanies() {
    return companies;
  }

  function getJobs() {
    return jobs;
  }

  function getBanks() {
    return banks;
  }

  async function createEmployee(row: IEmployee) {
    try {
      let data = await useFetch("/api/employee/create-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cachedEmployeesRows = null;
        toast.success("Сотрудник успешно создан!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при создании сотрудника");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getEmployees() {
    try {
      if (cachedEmployeesRows) {
        return cachedEmployeesRows;
      } else {
        let { data }: any = await useFetch("/api/employee/get-rows", {
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

  async function updateEmployee(row: IEmployee) {
    try {
      let data = await useFetch("/api/employee/edit-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cachedEmployeesRows = null;
        toast.success("Сотрудник успешно обновлен!");
      } else {
        toast.error("Произошла ошибка при обновлении сотрудника!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      }
    }
  }

  async function deleteEmployee(id: number) {
    try {
      let data = await useFetch("/api/employee/delete-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      if (data.data.value === undefined) {
        toast.success("Сотрудник успешно удален!");
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
    getJobs,
    getPVZ,
    getCompanies,
    getBanks,
    updateEmployee,
    getEmployees,
    createEmployee,
    deleteEmployee,
  };
});
