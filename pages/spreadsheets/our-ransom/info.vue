<script setup lang="ts">
import Cookies from "js-cookie";
import { useCellsStore } from "../../../stores/cell";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storeCells = useCellsStore();
const router = useRouter();

let user = ref({} as User);
let rowsOurRansom = ref<Array<IOurRansom>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rowsOurRansom.value = await storeRansom.getRansomRowsWithPVZOurRansom();
  await storeRansom.updateDpStatus();

  if (user.value.role === "SORTIROVKA") {
    router.push("/spreadsheets/our-ransom");
  }

  isLoading.value = false;

  // let rowsWithDeleted = await storeRansom.getRansomRowsWithDeletedForCellsOurRansom();
  // await storeCells.updateCellsStatus(rowsWithDeleted);
});

function getCountOfItemsByPVZOurRansom(PVZ: string) {
  if (user.value.role !== "PVZ" && user.value.role !== "PPVZ") {
    return rowsOurRansom.value?.filter(
      (row) =>
        row.dispatchPVZ === PVZ && row.deliveredPVZ === null && row.deleted === null
    ).length;
  } else if (user.value.role === "PVZ" || user.value.role === "PPVZ") {
    let today = new Date().toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    return rowsOurRansom.value?.filter(
      (row) =>
        row.dispatchPVZ === PVZ &&
        row.deliveredSC !== null &&
        (new Date(row.issued).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }) === today ||
          row.issued === null)
    ).length;
  }
}

function getCountOfItemsByPVZOurRansomIssued(PVZ: string) {
  return rowsOurRansom.value?.filter(
    (row) =>
      row.dispatchPVZ === PVZ &&
      row.deliveredSC !== null &&
      row.deliveredPVZ !== null &&
      row.issued === null &&
      row.deleted === null
  ).length;
}

definePageMeta({
  layout: false,
  name: "Выбор ПВЗ (Товары клиентов)",
});
</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="py-5" v-if="!isLoading">
          <div class="flex flex-col gap-5 mt-10">
            <div class="flex items-start gap-5">
              <h1 class="font-bold text-xl max-sm:text-lg">Список ПВЗ</h1>
              <UIActionButton
                v-if="
                  user.role === 'ADMIN' ||
                  user.role === 'ADMINISTRATOR' ||
                  user.role === 'RMANAGER' ||
                  user.role === 'SORTIROVKA'
                "
                @click="router.push('/spreadsheets/our-ransom')"
                >Все товары</UIActionButton
              >
            </div>
            <div
              @click="router.push(`/spreadsheets/our-ransom/${pvz}`)"
              v-for="pvz in user.PVZ"
              class="border-2 border-secondary-color px-10 py-5 font-medium hover:bg-secondary-color hover:text-white duration-300 rounded-3xl relative cursor-pointer"
            >
              <h1 class="text-xl font-bold">{{ pvz }}</h1>
              <h1 v-if="user.role === 'ADMIN'">
                Товаров заказано:
                <span class="font-bold">{{ getCountOfItemsByPVZOurRansom(pvz) }}</span>
              </h1>
              <h1 v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'">
                Товаров на выдачу:
                <span class="font-bold">{{
                  getCountOfItemsByPVZOurRansomIssued(pvz)
                }}</span>
              </h1>
              <h1 v-if="user.role === 'PVZ' || user.role === 'PPVZ'">
                Товаров на выдачу:
                <span class="font-bold">{{ getCountOfItemsByPVZOurRansom(pvz) }}</span>
              </h1>
              <h1 class="absolute right-10 italic top-9">
                <Icon name="solar:box-bold-duotone" size="40" />
              </h1>
            </div>
          </div>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user">
        <div class="py-5" v-if="!isLoading">
          <div class="flex flex-col gap-5 mt-10">
            <div class="flex items-start gap-5 max-sm:flex-col">
              <h1 class="font-bold text-xl max-sm:text-lg">Список ПВЗ</h1>
              <UIActionButton
                v-if="
                  user.role === 'ADMIN' ||
                  user.role === 'ADMINISTRATOR' ||
                  user.role === 'RMANAGER' ||
                  user.role === 'SORTIROVKA'
                "
                @click="router.push('/spreadsheets/our-ransom')"
                >Все товары</UIActionButton
              >
            </div>
            <div
              @click="router.push(`/spreadsheets/our-ransom/${pvz}`)"
              v-for="pvz in user.PVZ"
              class="border-2 border-secondary-color px-10 py-5 font-medium hover:bg-secondary-color hover:text-white duration-300 rounded-full relative cursor-pointer"
            >
              <h1 class="text-xl font-bold">{{ pvz }}</h1>
              <h1 v-if="user.role === 'ADMIN'">
                Товаров заказано:
                <span class="font-bold">{{ getCountOfItemsByPVZOurRansom(pvz) }}</span>
              </h1>
              <h1 v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'">
                Товаров на выдачу:
                <span class="font-bold">{{
                  getCountOfItemsByPVZOurRansomIssued(pvz)
                }}</span>
              </h1>
              <h1 v-if="user.role === 'PVZ' || user.role === 'PPVZ'">
                Товаров на выдачу:
                <span class="font-bold">{{ getCountOfItemsByPVZOurRansom(pvz) }}</span>
              </h1>
              <h1 class="absolute right-10 italic top-9">
                <Icon name="solar:box-bold-duotone" size="40" />
              </h1>
            </div>
          </div>
        </div>
      </NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
