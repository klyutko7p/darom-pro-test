<script setup lang="ts">
import { useToast } from "vue-toastification";
import Cookies from "js-cookie";
import { vAutoAnimate } from "@formkit/auto-animate";

let toast = useToast();

const route = useRoute();
let pvzString = route.params.pvz;

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZStore();
const storeSortingCenters = useSortingCentersStore();
const storeOrderAccounts = useOrderAccountStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

let rows = ref<Array<IOurRansom>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();
let orderAccounts = ref<Array<OrderAccount>>();

const filteredRows = ref<Array<IOurRansom>>();
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
    } else if (user.value.role === "COURIER") {
      filteredRows.value = filteredRows.value.filter(
        (row) =>
          row.deliveredSC !== null &&
          row.deliveredPVZ !== null &&
          row.issued === null
      );
    }
  }
}

onMounted(async () => {
  if (!token || user.value.dataOurRansom === "NONE") {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");

  if (rows.value) {
    handleFilteredRows(rows.value);
  }

  if (!user.value.PVZ.includes(pvzString)) {
    toast.error("У вас нет прав на просмотр этого ПВЗ!");
    router.push("/spreadsheets/our-ransom");
  }

  isLoading.value = false;

  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  orderAccounts.value = await storeOrderAccounts.getOrderAccounts();
});

definePageMeta({
  layout: false,
  name: "Товары из",
});

const token = Cookies.get("token");

const myInput = ref(null);
let isScanActive = ref(false);
let scanStringItem = ref("");
let timeoutId: ReturnType<typeof setTimeout> | null = null;

function focusInput() {
  myInput.value.focus();
  isScanActive.value = true;
}

const isShowDeletedData = ref(false)
async function showDeletedData() {
  isLoading.value = true;
  rows.value = await storeRansom.getDeletedRansomRowsByPVZ(
    pvzString,
    "OurRansom"
  );

  if (rows.value) {
    handleFilteredRows(rows.value);
  }

  isShowDeletedData.value = true;
  isLoading.value = false;
}

async function showData() {
  isLoading.value = true;
  rows.value = await storeRansom.getRansomRowsByPVZ(
    pvzString,
    "OurRansom"
  );

  if (rows.value) {
    handleFilteredRows(rows.value);
  }
  isShowDeletedData.value = false;
  isLoading.value = false;
}

function scanItem() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(async () => {
    let scannedLink = scanStringItem.value.trim();
    scannedLink = convertUrl(scannedLink);
    if (window.location.href.includes("soft-praline-633324.netlify.app")) {
      window.location.href =
        "https://darom.pro/spreadsheets/our-ransom/ПВЗ" + scannedLink;
    }
    scanStringItem.value = "";
  }, 500);
}

function convertUrl(url: string): string {
  const convertedUrl = url.replace(/\./g, "/");
  return convertedUrl;
}
</script>

<template>
  <Head>
    <Title>Наш выкуп</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-3">
          <div class="mt-10 flex items-center justify-center">
            <UIMainButton @click="focusInput">СКАНИРОВАТЬ</UIMainButton>
            <input
              class="opacity-0 max-w-[1px]"
              ref="myInput"
              autofocus
              v-model="scanStringItem"
              @input="scanItem"
            />
          </div>
          <div class="flex items-center gap-5 mt-10">
            <div
              v-if="!isShowDeletedData"
              v-auto-animate
              @click="showDeletedData"
              class="flex items-center gap-2 w-[220px] bg-green-100 text-green-500 px-2 py-1 font-bold cursor-pointer duration-200 hover:opacity-50 rounded-xl"
            >
              <Icon name="fluent:eye-show-16-filled" size="24" />
              <h1>Показать удаленное</h1>
            </div>
            <div
              v-if="isShowDeletedData"
              v-auto-animate
              @click="showData"
              class="flex items-center gap-2 w-[220px] bg-red-100 text-red-500 px-2 py-1 font-bold cursor-pointer duration-200 hover:opacity-50 rounded-xl"
            >
              <Icon name="fluent:eye-hide-20-filled" size="24" />
              <h1>Скрыть удаленное</h1>
            </div>
          </div>
          <SpreadsheetsOurRansomTable
            :rows="filteredRows"
            :user="user"
            :pvz-link="pvzString"
            v-auto-animate
          />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div v-if="!isLoading" class="mt-3">
          <div class="mt-10 flex items-center justify-center">
            <UIMainButton @click="focusInput">СКАНИРОВАТЬ</UIMainButton>
            <input
              class="opacity-0 max-w-[1px]"
              ref="myInput"
              autofocus
              v-model="scanStringItem"
              @input="scanItem"
            />
          </div>
          <SpreadsheetsOurRansomTable
            :rows="filteredRows"
            :user="user"
            :pvz-link="pvzString"
            v-auto-animate
          />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
