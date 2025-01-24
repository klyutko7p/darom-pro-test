<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fomoljxhkywsdgnchewy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW9sanhoa3l3c2RnbmNoZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1ODMwMTksImV4cCI6MjAzOTE1OTAxOX0.ItZhBr3_OBP0nii6RX-jy9Q7hu2qvNQ2UBVZNJyZDFs"
);

const toast = useToast();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storeClients = useClientsStore();

const router = useRouter();

const user = ref<User>({} as User);
const clients = ref<Client[]>([]);
const isLoading = ref(false);
const isScanActive = ref(false);
const scanStringItem = ref("");
const scannedLink = ref("");
const arrayOfRows = ref<IOurRansom[]>([]);
const rowData = ref<IOurRansom | null>(null);
const myInput = ref<HTMLInputElement | null>(null);
const selectedPVZ = ref(Cookies.get("selectedPVZ") || "");
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const token = Cookies.get("token");

onMounted(async () => {
  if (!token) {
    return router.push("/auth/login");
  }

  isLoading.value = true;
  try {
    user.value = await storeUsers.getUser();
    clients.value = await storeClients.getClients();
    const storedArray = localStorage.getItem("arrayOfRowsStorage");
    arrayOfRows.value = storedArray ? JSON.parse(storedArray) : [];
    handleFilteredRows(arrayOfRows.value);
  } catch (error) {
    toast.error("Failed to fetch user or clients data.");
  } finally {
    isLoading.value = false;
    focusInput();
  }
});

definePageMeta({
  layout: false,
  name: "Инвентаризация",
});

function focusInput() {
  isScanActive.value = true;
  isShowOtherRows.value = false;
  myInput.value?.focus();
}

function formatPhoneNumber(phoneNumber: string) {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  if (digitsOnly.length < 11) {
    return "Неправильный формат номера телефона";
  }
  return `+7${"*".repeat(digitsOnly.length - 5)}${digitsOnly.slice(-4)}`;
}

function convertToURL(inputString: string): number {
  const parts = inputString.split(/[/.]/);
  return Number(parts[parts.length - 1]) || 0;
}

async function scanItem() {
  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(async () => {
    const trimmedScanString = scanStringItem.value.trim();
    if (!trimmedScanString) {
      console.warn("Сканированная строка пуста.");
      return;
    }

    scannedLink.value = trimmedScanString;
    const idRow = convertToURL(scannedLink.value);
    scanStringItem.value = "";

    try {
      if (
        (scannedLink.value.includes("/") &&
          scannedLink.value.split("/")[5] === "1") ||
        (scannedLink.value.includes(".") &&
          scannedLink.value.split(".")[5] === "1")
      ) {
        rowData.value = await storeRansom.getRansomRowById(idRow, "OurRansom");
      } else {
        rowData.value = await storeRansom.getRansomRowById(
          idRow,
          "ClientRansom"
        );
      }
      if (rowData.value) {
        // await acceptItem(rowData.value);
        arrayOfRows.value.unshift(rowData.value);
        localStorage.setItem(
          "arrayOfRowsStorage",
          JSON.stringify(arrayOfRows.value)
        );
        storeRansom.announce(`${rowData.value.cell}`);
        console.log("Полученные данные:", rowData.value);
      } else {
        console.warn("Данные не найдены для:", idRow);
      }
    } catch (error) {
      console.error("Ошибка при обработке данных:", error);
    } finally {
      scannedLink.value = "";
      rowData.value = null;
    }
  }, 1700);

  focusInput();
}

function updateCookies() {
  Cookies.set("selectedPVZ", selectedPVZ.value, { expires: 7 });
}

watch(selectedPVZ, updateCookies);

watch(scanStringItem, (newValue) => {
  if (newValue) scanItem();
});

let checkDataRows = ref<Array<IOurRansom>>([]);
let differentPVZRows = ref<Array<IOurRansom>>([]);
let issuedRows = ref<Array<IOurRansom>>([]);
let nonScanningRows = ref<Array<IOurRansom>>([]);
let nonDeliveredPVZRows = ref<Array<IOurRansom>>([]);
let isShowOtherRows = ref(false);

async function checkData() {
  isLoading.value = true;
  isShowOtherRows.value = true;
  checkDataRows.value = await storeRansom.getRansomRowsByPVZInventory(
    selectedPVZ.value
  );
  differentPVZRows.value = arrayOfRows.value.filter(
    (row) => row.dispatchPVZ !== selectedPVZ.value
  );
  issuedRows.value = arrayOfRows.value.filter((row) => row.issued);
  nonScanningRows.value = checkDataRows.value.filter((row) => {
    return (
      !arrayOfRows.value.some((arrayRow) => arrayRow.id === row.id) &&
      row.deliveredPVZ &&
      !row.issued
    );
  });
  nonDeliveredPVZRows.value = arrayOfRows.value.filter(
    (row) => !row.deliveredPVZ && row.dispatchPVZ === selectedPVZ.value
  );

  if (differentPVZRows.value.length) {
    const jsonData = JSON.stringify(differentPVZRows.value, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    const { data, error } = await supabase.storage.from("inventory").upload(
      `differentPVZRows/${
        selectedPVZ.value[selectedPVZ.value.length - 1]
      }/${new Date().toLocaleDateString("ru", {
        day: "2-digit",
        month: "2-digit",
      })}/${user.value.id}/${Date.now()}`,
      blob
    );
  }

  if (issuedRows.value.length) {
    const jsonData = JSON.stringify(issuedRows.value, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    const { data, error } = await supabase.storage.from("inventory").upload(
      `issuedRows/${
        selectedPVZ.value[selectedPVZ.value.length - 1]
      }/${new Date().toLocaleDateString("ru", {
        day: "2-digit",
        month: "2-digit",
      })}/${user.value.id}/${Date.now()}`,
      blob
    );
  }

  if (nonScanningRows.value.length) {
    const jsonData = JSON.stringify(nonScanningRows.value, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    const { data, error } = await supabase.storage.from("inventory").upload(
      `nonScanningRows/${
        selectedPVZ.value[selectedPVZ.value.length - 1]
      }/${new Date().toLocaleDateString("ru", {
        day: "2-digit",
        month: "2-digit",
      })}/${user.value.id}/${Date.now()}`,
      blob
    );
  }

  if (nonDeliveredPVZRows.value.length) {
    const jsonData = JSON.stringify(nonDeliveredPVZRows.value, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    const { data, error } = await supabase.storage.from("inventory").upload(
      `nonDeliveredPVZRows/${
        selectedPVZ.value[selectedPVZ.value.length - 1]
      }/${new Date().toLocaleDateString("ru", {
        day: "2-digit",
        month: "2-digit",
      })}/${user.value.id}/${Date.now()}`,
      blob
    );
  }

  isLoading.value = false;
}

function clearData() {
  localStorage.removeItem("arrayOfRowsStorage");
  arrayOfRows.value = [];
}

const filteredRows = ref<Array<IOurRansom>>([]);
function handleFilteredRows(filteredRowsData: IOurRansom[]) {
  filteredRows.value = filteredRowsData;
  arrayOfRows.value = filteredRows.value;
  differentPVZRows.value = arrayOfRows.value.filter(
    (row) => row.dispatchPVZ !== selectedPVZ.value
  );
  issuedRows.value = arrayOfRows.value.filter((row) => row.issued);
  nonScanningRows.value = checkDataRows.value.filter((row) => {
    return (
      !arrayOfRows.value.some((arrayRow) => arrayRow.id === row.id) &&
      row.deliveredPVZ &&
      !row.issued
    );
  });
  nonDeliveredPVZRows.value = arrayOfRows.value.filter(
    (row) => !row.deliveredPVZ && row.dispatchPVZ === selectedPVZ.value
  );
  const storedArray = localStorage.getItem("arrayOfRowsStorage");
  arrayOfRows.value = storedArray ? JSON.parse(storedArray) : [];
}

async function updateDeliveryRows(obj: any) {
  if (obj.flag !== "additionally") {
    let answer = confirm(
      `Вы точно хотите изменить статус доставки? Количество записей: ${obj.idArray.length}`
    );
    if (answer) {
      await storeRansom.updateDeliveryRowsStatus(
        obj.idArray,
        obj.flag,
        "OurRansom",
        user.value.username
      );
      await checkData();
    }
  }
}

async function deleteSelectedRows(idArray: number[]) {
  let answer = confirm(
    `Вы точно хотите удалить данные строки? Количество записей: ${idArray.length}`
  );
  if (answer) {
    await storeRansom.deleteRansomSelectedRows(idArray, "OurRansom");
    await checkData();
  }
}
</script>

<template>
  <Head>
    <Title>Инвентаризация</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div class="px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <div>
            <h1 class="mb-3 font-bold text-xl">
              Выберите нужное ПВЗ, чтобы начать инвентаризацию!
            </h1>
            <select
              class="py-1 px-2 border-2 bg-transparent rounded-lg text-base"
              v-model="selectedPVZ"
              @change="updateCookies"
              name="pvz"
            >
              <option disabled value="">Выберите ПВЗ</option>
              <option v-for="pvz in user.PVZ">{{ pvz }}</option>
            </select>
          </div>
          <div v-if="selectedPVZ">
            <div class="flex items-center flex-col justify-center gap-5 mt-10">
              <div class="flex items-center gap-5">
                <UIActionButton @click="checkData">проверить</UIActionButton>
                <UIActionButton @click="clearData">очистить</UIActionButton>
              </div>
              <div class="flex items-center gap-5">
                <UIMainButton @click="focusInput"
                  >НАЧАТЬ ИНВЕНТАРИЗАЦИЮ</UIMainButton
                >
                <Icon
                  v-if="isScanActive"
                  name="eos-icons:bubble-loading"
                  class="text-secondary-color"
                />
              </div>
            </div>

            <input
              ref="myInput"
              class="opacity-0"
              autofocus
              v-model="scanStringItem"
              @input="scanItem"
            />

            <SpreadsheetsOurRansomFilters
              v-if="arrayOfRows"
              @filtered-rows="handleFilteredRows"
              :rows="arrayOfRows"
              :user="user"
              class="mb-10"
            />

            <SpreadsheetsOurRansomNewTable
              v-if="!isShowOtherRows"
              :rows="arrayOfRows"
              :user="user"
              @update-delivery-rows="updateDeliveryRows"
              @delete-selected-rows="deleteSelectedRows"
            />
            <div class="space-y-5 text-left" v-if="isShowOtherRows">
              <div>
                <h1 class="font-semibold text-xl">
                  Товары не этого ПВЗ, но отсканированы
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="differentPVZRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
              <div>
                <h1 class="font-semibold text-xl">
                  Товары, которые програмно выданы клиенту, но отсканированы
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="issuedRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
              <div>
                <h1 class="font-semibold text-xl">
                  Товары, которые не отсканированы, но должны быть на ПВЗ
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="nonScanningRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
              <div>
                <h1 class="font-semibold text-xl">
                  Товары, которые не приняты на ПВЗ, но отсканированы
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="nonDeliveredPVZRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
            </div>
          </div>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="table-user-no-pad">
        <div class="px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <div>
            <h1 class="mb-3 font-bold text-xl">
              Выберите нужное ПВЗ, чтобы начать инвентаризацию!
            </h1>
            <select
              class="py-1 px-2 border-2 bg-transparent rounded-lg text-base"
              v-model="selectedPVZ"
              @change="updateCookies"
              name="pvz"
            >
              <option disabled value="">Выберите ПВЗ</option>
              <option v-for="pvz in user.PVZ">{{ pvz }}</option>
            </select>
          </div>
          <div v-if="selectedPVZ">
            <div class="flex items-center flex-col justify-center gap-5 mt-10">
              <div class="flex items-center gap-5">
                <UIActionButton @click="checkData">проверить</UIActionButton>
                <UIActionButton @click="clearData">очистить</UIActionButton>
              </div>
              <div class="flex items-center gap-5">
                <UIMainButton @click="focusInput"
                  >НАЧАТЬ ИНВЕНТАРИЗАЦИЮ</UIMainButton
                >
                <Icon
                  v-if="isScanActive"
                  name="eos-icons:bubble-loading"
                  class="text-secondary-color"
                />
              </div>
            </div>

            <input
              ref="myInput"
              class="opacity-0"
              autofocus
              v-model="scanStringItem"
              @input="scanItem"
            />

            <SpreadsheetsOurRansomFilters
              v-if="arrayOfRows"
              @filtered-rows="handleFilteredRows"
              :rows="arrayOfRows"
              :user="user"
              class="mb-10"
            />

            <SpreadsheetsOurRansomNewTable
              v-if="!isShowOtherRows"
              :rows="arrayOfRows"
              :user="user"
              @update-delivery-rows="updateDeliveryRows"
              @delete-selected-rows="deleteSelectedRows"
            />
            <div class="space-y-5 text-left" v-if="isShowOtherRows">
              <div>
                <h1 class="font-semibold text-xl">
                  Товары не этого ПВЗ, но отсканированы
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="differentPVZRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
              <div>
                <h1 class="font-semibold text-xl">
                  Товары, которые програмно выданы клиенту, но отсканированы
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="issuedRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
              <div>
                <h1 class="font-semibold text-xl">
                  Товары, которые не отсканированы, но должны быть на ПВЗ
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="nonScanningRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
              <div>
                <h1 class="font-semibold text-xl">
                  Товары, которые не приняты на ПВЗ, но отсканированы
                </h1>
                <SpreadsheetsOurRansomNewTable
                  v-if="isShowOtherRows"
                  :rows="nonDeliveredPVZRows"
                  :user="user"
                  @update-delivery-rows="updateDeliveryRows"
                  @delete-selected-rows="deleteSelectedRows"
                />
              </div>
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
