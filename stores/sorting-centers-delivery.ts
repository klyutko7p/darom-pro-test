import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useSortingCentersDeliveryStore = defineStore(
  "sorting-centers-delivery",
  () => {
    let cachedSortingCenters: any = null;

    async function getSortingCenters() {
      if (cachedSortingCenters) {
        return cachedSortingCenters;
      } else {
        try {
          let { data }: any = await useFetch(
            "/api/sorting-centers-delivery/get-sc-delivery",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          cachedSortingCenters = data.value;
          return cachedSortingCenters;
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message);
          }
        }
      }
    }

    async function createSortingCenter(name: string, address: string) {
      try {
        if (name === "") {
          toast.warning("Название Сортировочного Центра не должно быть пустым");
        } else {
          let data = await useFetch(
            "/api/sorting-centers-delivery/create-sc-delivery",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: name, address: address }),
            }
          );
          cachedSortingCenters = null;
          toast.success("Сортировочный Центр успешно добавлен!");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }

    async function updateSortingCenters(sortingCenter: SortingCenter) {
      try {
        let data = await useFetch(
          "/api/sorting-centers-delivery/edit-sc-delivery",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sortingCenter: sortingCenter }),
          }
        );
        cachedSortingCenters = null;
        toast.success("Сортировочный Центр успешно обновлен!");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }

    async function deleteSortingCenter(id: number) {
      try {
        let data = await useFetch(
          "/api/sorting-centers-delivery/delete-sc-delivery",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: id }),
          }
        );
        cachedSortingCenters = null;
        toast.success("Сортировочный Центр успешно удален!");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }

    return {
      getSortingCenters,
      createSortingCenter,
      updateSortingCenters,
      deleteSortingCenter,
    };
  }
);
