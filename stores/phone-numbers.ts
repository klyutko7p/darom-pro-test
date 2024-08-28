import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const usePhoneNumbersStore = defineStore("phone-numbers", () => {
  let cashedPhoneNumbers: IPhoneNumber[] | null = null;

  async function createPhoneNumber(row: IPhoneNumber) {
    try {
      if (row.number === undefined) row.number = "";
      if (row.address === undefined) row.address = "";

      let data = await useFetch("/api/phone-number/create-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cashedPhoneNumbers = null;
        toast.success("Привязка прошла успешно!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при привязке");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getPhoneNumbers() {
    try {
      if (cashedPhoneNumbers) {
        return cashedPhoneNumbers;
      } else {
        let { data }: any = await useFetch("/api/phone-number/get-rows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        cashedPhoneNumbers = data.value;
        return cashedPhoneNumbers;
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getPhoneNumberByFromName(fromName: string) {
    try {
      let { data }: any = await useFetch(
        "/api/phone-number/get-row-by-fromName",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fromName: fromName }),
        }
      );
      cashedPhoneNumbers = data.value;
      return cashedPhoneNumbers;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updatePhoneNumbers(row: IPhoneNumber) {
    try {
      if (row.number === undefined) row.number = "";
      if (row.address === undefined) row.address = "";

      let data = await useFetch("/api/phone-number/edit-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row }),
      });

      if (data.data.value === undefined) {
        cashedPhoneNumbers = null;
        toast.success("Номер успешно обновлен!");
      } else {
        toast.error("Произошла ошибка при обновлении номера!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      }
    }
  }
  return {
    updatePhoneNumbers,
    getPhoneNumbers,
    createPhoneNumber,
    getPhoneNumberByFromName,
  };
});
