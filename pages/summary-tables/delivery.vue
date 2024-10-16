<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZDeliveryStore();
const storeSortingCenters = useSortingCentersDeliveryStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

let rows = ref<Array<IDelivery>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();

const filteredRows = ref<Array<IDelivery>>();

function handleFilteredRows(filteredRowsData: IDelivery[]) {
  filteredRows.value = filteredRowsData;
}

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeRansom.getRansomRows("Delivery");
  if (rows.value) {
    handleFilteredRows(rows.value);
  }

  isLoading.value = false;

  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();

  if (!token || user.value.dataDelivery === "NONE") {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: "Доставка и Сортировка: Сводные таблицы",
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Сводные таблицы</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-14">
          <div>
            <SpreadsheetsDeliveryFilters
              v-if="rows"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
            />
            <DeliverySummaryTable :user="user" :rows="filteredRows" />
          </div>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div v-if="!isLoading" class="mt-14"></div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
