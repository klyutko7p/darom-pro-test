<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

const filteredRows = ref<Array<IOurRansom>>([]);
function handleFilteredRows(filteredRowsData: IOurRansom[]) {
  if (user.value.visiblePVZ === "ВСЕ" && user.value.visibleSC === "ВСЕ") {
    filteredRows.value = filteredRowsData;
  } else if (
    user.value.visiblePVZ === "ВСЕ" &&
    user.value.visibleSC !== "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter(
      (row) => row.orderPVZ === user.value.visibleSC && row.deliveredSC !== null
    );
  } else if (
    user.value.visiblePVZ !== "ВСЕ" &&
    user.value.visibleSC === "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter(
      (row) =>
        user.value.PVZ.includes(row.dispatchPVZ) && row.deliveredSC !== null
    );
  } else if (
    user.value.visiblePVZ !== "ВСЕ" &&
    user.value.visibleSC !== "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter(
      (row) =>
        user.value.PVZ.includes(row.dispatchPVZ) &&
        row.orderPVZ === user.value.visibleSC &&
        row.deliveredSC !== null
    );
  }

  if (filteredRows.value) {
    if (user.value.role === "SORTIROVKA") {
      filteredRows.value = filteredRows.value.filter(
        (row) => row.deliveredPVZ === null
      );
    } else if (user.value.role === "PVZ" || user.value.role === "PPVZ") {
      let today = new Date().toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
      filteredRows.value = filteredRows.value.filter(
        (row) =>
          row.deliveredSC !== null &&
          (new Date(row.issued).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }) === today ||
            row.issued === null)
      );
    }
  }
}

let originallyRows = ref<Array<IOurRansom>>();

const uniqueOrderAccounts = ref<Array<string>>([]);
const uniqueNotation = ref<Array<string>>([]);
const uniqueOrderPVZ = ref<Array<string>>([]);
const uniquePVZ = ref<Array<string>>([]);
const uniqueCells = ref<Array<string>>([]);
const uniqueFromNames = ref<Array<string>>([]);
const uniqueProductNames = ref<Array<string>>([]);
const uniqueAdditionally = ref<Array<string>>([]);
const uniquePriceSite = ref<Array<string>>([]);

onMounted(async () => {
  if (!token || user.value.dataOurRansom === "NONE") {
    router.push("/auth/login");
  }

  const [
    orderAccounts,
    notation,
    orderPVZ,
    dispatchPVZ,
    cells,
    fromNames,
    productNames,
    additionally,
    priceSite,
  ] = await Promise.all([
    storeRansom.getUniqueNonEmptyValuesQuery("orderAccount"),
    storeRansom.getUniqueNonEmptyValuesQuery("notation"),
    storeRansom.getUniqueNonEmptyValuesQuery("orderPVZ"),
    storeRansom.getUniqueNonEmptyValuesQuery("dispatchPVZ"),
    storeRansom.getUniqueNonEmptyValuesQuery("cell"),
    storeRansom.getUniqueNonEmptyValuesQuery("fromName"),
    storeRansom.getUniqueNonEmptyValuesQuery("productName"),
    storeRansom.getUniqueNonEmptyValuesQuery("additionally"),
    storeRansom.getUniqueNonEmptyValuesQuery("priceSite"),
  ]);

  uniqueOrderAccounts.value = orderAccounts;
  uniqueNotation.value = notation;
  uniqueOrderPVZ.value = orderPVZ;
  uniquePVZ.value = dispatchPVZ;
  uniqueCells.value = cells;
  uniqueFromNames.value = fromNames;
  uniqueProductNames.value = productNames;
  uniqueAdditionally.value = additionally;
  uniquePriceSite.value = priceSite;

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  isLoading.value = false;

  originallyRows.value = await storeRansom.getRansomRowsForModalOurRansom();
});

definePageMeta({
  layout: false,
  name: "Все данные: Наш Выкуп",
});

const token = Cookies.get("token");

async function updateDeliveryRows(obj: any) {
  if (obj.flag !== "additionally") {
    let answer = confirm(
      `Вы точно хотите изменить статус доставки? Количество записей: ${obj.idArray.length}`
    );
    if (answer) {
      isLoading.value = true;
      await storeRansom.updateDeliveryRowsStatus(
        obj.idArray,
        obj.flag,
        "OurRansom",
        user.value.username
      );
      isLoading.value = false;
    }
  }
}
</script>

<template>
  <Head>
    <Title>Все данные</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-3">
          <div>
            <SpreadsheetsAllDataFilters
              @filtered-rows="handleFilteredRows"
              :uniqueOrderAccounts="uniqueOrderAccounts"
              :uniqueNotation="uniqueNotation"
              :uniqueOrderPVZ="uniqueOrderPVZ"
              :uniquePVZ="uniquePVZ"
              :uniqueCells="uniqueCells"
              :uniqueFromNames="uniqueFromNames"
              :uniqueProductNames="uniqueProductNames"
              :uniqueAdditionally="uniqueAdditionally"
              :uniquePriceSite="uniquePriceSite"
              :user="user"
            />
          </div>

          <SpreadsheetsAllDataTable :rows="filteredRows" :user="user" />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div v-if="!isLoading" class="mt-3">
          <div>
            <SpreadsheetsAllDataFilters
              @filtered-rows="handleFilteredRows"
              :user="user"
            />
          </div>

          <SpreadsheetsAllDataTable :rows="filteredRows" :user="user" />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
