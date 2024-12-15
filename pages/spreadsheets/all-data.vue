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
      (row) => row.orderPVZ === user.value.visibleSC
    );
  } else if (
    user.value.visiblePVZ !== "ВСЕ" &&
    user.value.visibleSC === "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter((row) =>
      user.value.PVZ.includes(row.dispatchPVZ)
    );
  } else if (
    user.value.visiblePVZ !== "ВСЕ" &&
    user.value.visibleSC !== "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter(
      (row) =>
        user.value.PVZ.includes(row.dispatchPVZ) &&
        row.orderPVZ === user.value.visibleSC
    );
  }

  if (filteredRows.value) {
    if (user.value.role === "SORTIROVKA") {
      filteredRows.value = filteredRows.value;
    } else if (user.value.role === "PVZ" || user.value.role === "PPVZ") {
      filteredRows.value = filteredRows.value;
    }
  }
}

let originallyRows = ref<Array<IOurRansom>>();

const uniqueOrderAccounts = ref<Array<string>>([]);
const uniqueNotation = ref<Array<string>>([]);
const uniqueCreatedUser = ref<Array<string>>([]);
const uniqueOrderPVZ = ref<Array<string>>([]);
const uniquePVZ = ref<Array<string>>([]);
const uniqueCells = ref<Array<string>>([]);
const uniqueFromNames = ref<Array<string>>([]);
const uniqueAdditionally = ref<Array<string>>([]);
const uniquePriceSite = ref<Array<string>>([]);

onMounted(async () => {
  if (!token || user.value.dataOurRansom === "NONE") {
    router.push("/auth/login");
  }
  user.value = await storeUsers.getUser();

  isLoading.value = true;

  const [
    orderAccounts,
    notation,
    createdUser,
    orderPVZ,
    dispatchPVZ,
    cells,
    fromNames,
    additionally,
    priceSite,
  ] = await Promise.all([
    storeRansom.getUniqueNonEmptyValuesQuery("orderAccount"),
    storeRansom.getUniqueNonEmptyValuesQuery("createdUser"),
    storeRansom.getUniqueNonEmptyValuesQuery("notation"),
    storeRansom.getUniqueNonEmptyValuesQuery("orderPVZ"),
    storeRansom.getUniqueNonEmptyValuesQuery("dispatchPVZ"),
    storeRansom.getUniqueNonEmptyValuesQuery("cell"),
    storeRansom.getUniqueNonEmptyValuesQuery("fromName"),
    storeRansom.getUniqueNonEmptyValuesQuery("additionally"),
    storeRansom.getUniqueNonEmptyValuesQuery("priceSite"),
  ]);

  uniqueOrderAccounts.value = orderAccounts;
  uniqueNotation.value = notation;
  uniqueCreatedUser.value = notation;
  uniqueOrderPVZ.value = orderPVZ;
  uniquePVZ.value = dispatchPVZ;
  uniqueCells.value = cells;
  uniqueFromNames.value = fromNames;
  uniqueAdditionally.value = additionally;
  uniquePriceSite.value = priceSite;

  if (uniqueOrderAccounts.value) {
    uniqueOrderAccounts.value = Array.from(
      new Set(
        uniqueOrderAccounts.value
          .filter((item) => item && !item.includes("��"))
          .map((item) => item.trim())
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }

  if (uniqueNotation.value) {
    uniqueNotation.value = Array.from(
      new Set(
        uniqueNotation.value
          .filter((item) => item && !item.includes("��"))
          .map((item) => item.trim())
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }

  if (uniqueCreatedUser.value) {
    uniqueCreatedUser.value = Array.from(
      new Set(
        uniqueCreatedUser.value
          .filter((item) => item && !item.includes("��") && !item.includes("+"))
          .map((item) => item.trim())
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }

  if (uniqueOrderPVZ.value) {
    uniqueOrderPVZ.value = Array.from(
      new Set(
        uniqueOrderPVZ.value
          .filter((item) => item && !item.includes("��"))
          .map((item) => item.trim())
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }

  if (uniquePVZ.value) {
    uniquePVZ.value = Array.from(
      new Set(
        uniquePVZ.value
          .filter((item) => item && !item.includes("��"))
          .map((item) => item.trim())
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }

  if (uniqueCells.value) {
    uniqueCells.value = Array.from(
      new Set(
        uniqueCells.value
          .filter((item) => item && !item.includes("��"))
          .map((item) => item.trim())
      )
    );
  }

  if (uniqueFromNames.value) {
    uniqueFromNames.value = Array.from(
      new Set(
        uniqueFromNames.value
          .filter((item) => item && !item.includes("��"))
          .map((item) => item.trim())
      )
    );
  }

  if (uniqueAdditionally.value) {
    uniqueAdditionally.value = Array.from(
      new Set(
        uniqueAdditionally.value
          .filter((item) => item && !item.includes("��"))
          .map((item) => item.trim())
          .sort((a, b) => a.localeCompare(b))
      )
    );
  }

  isLoading.value = false;
});

definePageMeta({
  layout: false,
  name: "Все данные",
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Все данные</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div v-if="!isLoading" class="mt-3">
          <div>
            <SpreadsheetsAllDataFilters
              @filtered-rows="handleFilteredRows"
              :uniqueOrderAccounts="uniqueOrderAccounts"
              :uniqueNotation="uniqueNotation"
              :uniqueCreatedUser="uniqueCreatedUser"
              :uniqueOrderPVZ="uniqueOrderPVZ"
              :uniquePVZ="uniquePVZ"
              :uniqueCells="uniqueCells"
              :uniqueFromNames="uniqueFromNames"
              :uniqueAdditionally="uniqueAdditionally"
              :uniquePriceSite="uniquePriceSite"
              :user="user"
            />
          </div>

          <SpreadsheetsAllDataTable :rows="filteredRows" :user="user" />
        </div>
        <div class="w-screen" v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="table-user-no-pad">
        <div v-if="!isLoading" class="mt-3">
          <div>
            <SpreadsheetsAllDataFilters
              @filtered-rows="handleFilteredRows"
              :uniqueOrderAccounts="uniqueOrderAccounts"
              :uniqueNotation="uniqueNotation"
              :uniqueCreatedUser="uniqueCreatedUser"
              :uniqueOrderPVZ="uniqueOrderPVZ"
              :uniquePVZ="uniquePVZ"
              :uniqueCells="uniqueCells"
              :uniqueFromNames="uniqueFromNames"
              :uniqueAdditionally="uniqueAdditionally"
              :uniquePriceSite="uniquePriceSite"
              :user="user"
            />
          </div>

          <SpreadsheetsAllDataTable :rows="filteredRows" :user="user" />
        </div>
        <div class="w-screen" v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
