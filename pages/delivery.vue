<script setup lang="ts">
import Cookies from "js-cookie";
import { vAutoAnimate } from "@formkit/auto-animate";

const storeClients = useClientsStore();
const storeRansom = useRansomStore();
const storeUsers = useUsersStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
let pvzData = ref("");

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);
let isNotAskingWB = ref(false);
let isNotAskingOZ = ref(false);
let isNotAskingYM = ref(false);

const storeCells = useCellsStore();

let originallyRows = ref<Array<IOurRansom>>();
let cells = ref<Array<Cell>>();
let cellData = ref({} as Cell);
let marketplaceData = route.query.marketplace;
onMounted(async () => {
  const storedFileName = localStorage.getItem("fileName");
  if (storedFileName) {
    localStorage.removeItem("fileName");
  }

  const storedMarketplace = localStorage.getItem("marketplace");
  if (storedMarketplace) {
    marketplace.value = JSON.parse(storedMarketplace);
  }

  const storedIsNotAskingWB = localStorage.getItem("isNotAskingWB");
  if (storedIsNotAskingWB) {
    isNotAskingWB.value = JSON.parse(storedIsNotAskingWB);
  }

  const storedIsNotAskingOZ = localStorage.getItem("isNotAskingOZ");
  if (storedIsNotAskingOZ) {
    isNotAskingOZ.value = JSON.parse(storedIsNotAskingOZ);
  }

  const storedIsNotAskingYM = localStorage.getItem("isNotAskingYM");
  if (storedIsNotAskingYM) {
    isNotAskingYM.value = JSON.parse(storedIsNotAskingYM);
  }

  if (route.query.qr === "true") {
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    showThirdModal();
  }

  if (route.query.marketplace) {
    marketplaceData = route.query.marketplace;
  }

  checkAvailability();
  setInterval(checkAvailability, 5 * 60 * 1000);

  isLoading.value = true;
  user.value = await storeClients.getClient();

  originallyRows.value = await storeRansom.getRansomRowsForModalClientRansom();
  cells.value = await storeCells.getCellsClient();
  pvzData.value = localStorage.getItem("addressData") || "";
  pvzData.value = pvzData.value.replace(/"/g, "");

  await checkPercent();
  isLoading.value = false;
  if (marketplaceData === "ozon") {
    marketplace.value = "Ozon";
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    showThirdModal();
  } else if (marketplaceData === "wb") {
    marketplace.value = "Wildberries";
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    showThirdModal();
  } else if (marketplaceData === "ym") {
    marketplace.value = "Яндекс Маркет";
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    showThirdModal();
  }
  await updateCells();
});

async function updateCells() {
  let rowsWithDeleted = await storeRansom.getRansomRows("ClientRansom");
  await storeCells.updateCellsStatusClient(rowsWithDeleted);
  cells.value = await storeCells.getCellsClient();
  cells.value = cells.value?.filter((cell) => cell.PVZ !== "НаДом");
}

definePageMeta({
  layout: "client-no-pad-registration",
});

import { createClient } from "@supabase/supabase-js";
import { useToast } from "vue-toastification";

const supabase = createClient(
  "https://fomoljxhkywsdgnchewy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW9sanhoa3l3c2RnbmNoZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1ODMwMTksImV4cCI6MjAzOTE1OTAxOX0.ItZhBr3_OBP0nii6RX-jy9Q7hu2qvNQ2UBVZNJyZDFs"
);

let rowData = ref({} as IClientRansom);
let marketplace = ref("");

let phoneNumbersWithoutPercent = ref<Array<string>>([
  "+79494140214",
  "+79494140215",
  "+79493263518",
  "+79493485709",
  "+79494140217",
  "+79493479188",
  "+79494690310",
]);

async function getCellFromName() {
  const matchedCell = cells.value?.find(
    (cell) =>
      cell.fromName === rowData.value.fromName &&
      cell.PVZ === rowData.value.dispatchPVZ &&
      cell.status === "Занято"
  );

  if (matchedCell) {
    rowData.value.cell = matchedCell.name;
  } else {
    const freeCell = cells.value?.find(
      (cell) =>
        cell.PVZ === rowData.value.dispatchPVZ && cell.status === "Свободно"
    );
    if (freeCell) {
      rowData.value.cell = freeCell.name;
      cellData.value = freeCell;
    } else {
      console.warn("Нет свободных ячеек для выбранного ПВЗ");
    }
  }
}

const currentTime = new Date();
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();

const isDisabled = hours >= 18 && hours < 24 && minutes >= 1;
let isShowModal = ref(false);

const isOpenFirstModal = ref(true);
const isOpenSecondModal = ref(false);
const isOpenThirdModal = ref(false);
const isOpenFourModal = ref(false);
const isOpenLastModal = ref(false);

function showFirstModal() {
  isOpenFirstModal.value = true;
  isOpenSecondModal.value = false;
  isOpenThirdModal.value = false;
  isOpenLastModal.value = false;
}

function showSecondModal() {
  if (pvzData.value) {
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    isOpenThirdModal.value = true;
  } else {
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = true;
    isOpenThirdModal.value = false;
  }
}

function showThirdModal() {
  isOpenFirstModal.value = false;
  isOpenSecondModal.value = false;
  isOpenThirdModal.value = true;
  isOpenFourModal.value = false;
  isOpenLastModal.value = false;
  localStorage.setItem("addressData", JSON.stringify(pvzData.value));
}

function showFourModal() {
  isOpenFirstModal.value = false;
  isOpenSecondModal.value = false;
  isOpenThirdModal.value = false;
  isOpenFourModal.value = true;
  isOpenLastModal.value = false;
  localStorage.setItem("addressData", JSON.stringify(pvzData.value));
}

function showLastModal() {
  isOpenThirdModal.value = false;
  isOpenFourModal.value = false;
  isOpenLastModal.value = true;
}

let fileQRPhoto = ref({} as any);

function clearQRPhoto() {
  rowData.value.img = "";
  fileQRPhoto.value = {};
  localStorage.removeItem("fileName");
  localStorage.removeItem("marketplace");
}

const randomDigits = Math.floor(10000 + Math.random() * 90000);

async function handleFile(bucketName: string, file: any) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`img-${rowData.value.img}`, file);
}

function uploadQRFile(e: Event) {
  handleFileUpload(e);
}

function handleFileUpload(e: any) {
  let fileName = e[0].name;
  if (fileName.includes(".mp4") || fileName.includes(".mov")) {
    toast.error("Вставьте скриншот, а не файл видео-формата!");
  } else {
    rowData.value.img = `${randomDigits}-${fileName}`;
    fileQRPhoto.value = e[0];
    localStorage.setItem("fileName", JSON.stringify(rowData.value.img));
    localStorage.setItem("marketplace", JSON.stringify(marketplace.value));
  }
}

let isOpen = ref(true);

const pvzs = [
  {
    pvz: "ПВЗ_1",
    name: "г. Донецк, ул. Антропова 16",
  },
  {
    pvz: "ПВЗ_2",
    name: "г. Донецк, ул. Харитоново, 8",
  },
  {
    pvz: "ПВЗ_3",
    name: "г. Донецк, ул. Палладина, 16",
  },
  {
    pvz: "ПВЗ_4",
    name: "г. Донецк, ул. Нартова, 1",
  },
  {
    pvz: "ППВЗ_5",
    name: "г. Донецк, ул. Дудинская, д. 4, кв. 7",
  },
  {
    pvz: "ПВЗ_8",
    name: "г. Мариуполь, ул. Макара Мазая, 37А",
  },
  {
    pvz: "ППВЗ_9",
    name: "г. Мариуполь, ул. 8 Марта, 77",
  },
  {
    pvz: "ПВЗ_10",
    name: "г. Мариуполь, ул. Азовской Военной Флотилии, 2",
  },
  {
    pvz: "ПВЗ_11",
    name: "г. Мариуполь, ул. Азовстальская, 131",
  },
  {
    pvz: "ППВЗ_12",
    name: "г. Мариуполь, ул. Центральная, 43",
  },
  {
    pvz: "ППВЗ_14",
    name: "г. Мариуполь, пос. Старый Крым, павильон на центральном рынке",
  },
];

const marketplaces = [
  {
    marketplace: "Ozon",
    name: "OZON",
  },
  {
    marketplace: "Wildberries",
    name: "WILDBERRIES",
  },
  {
    marketplace: "Яндекс Маркет",
    name: "ЯНДЕКС МАРКЕТ",
  },
];

let linkToClient = ref("");
async function submitForm() {
  try {
    if (pvzData.value) {
      rowData.value.orderPVZ = "Ряженое";
      rowData.value.fromName = phoneNumberData.value;
      rowData.value.productLink = marketplace.value;
      rowData.value.dispatchPVZ = pvzData.value;
      if (phoneNumbersWithoutPercent.value.includes(phoneNumberData.value)) {
        rowData.value.percentClient = 0;
      }

      isLoading.value = true;

      await checkPercent();

      getCellFromName();

      const filePromises = [handleFile("image", fileQRPhoto.value)];

      await Promise.all(filePromises);

      await storeRansom.createRansomRow(
        rowData.value,
        phoneNumberData.value,
        "ClientRansom"
      );
      isOpen.value = false;
      isShowModal.value = true;
      if (cellData.value) {
        await storeCells.updateCellClient(
          cellData.value,
          "Занято",
          rowData.value.fromName
        );
      }

      await storeUsers.sendMessageToEmployee(
        "Доставка заказов по ШК (QR): Darom.pro",
        `Прикреплён новый штрих-код`,
        "Волошина"
      );

      localStorage.removeItem("fileName");
      localStorage.removeItem("marketplace");

      linkToClient.value =
        "https://darom.pro/spreadsheets/order/" +
        storeRansom.generateLink(phoneNumberData.value, "ClientRansom");
    } else {
      toast.error("Сначала выберите пункт выдачи!");
    }
  } catch (error) {
    console.error("Error while creating employee or handling files:", error);
  } finally {
    isLoading.value = false;
  }
}

function changeMarketplace(marketplaceData: string) {
  marketplace.value = marketplaceData;
  showSecondModal();
}

const isAvailable = ref(false);

const checkAvailability = () => {
  const now = new Date();
  const hours = now.getHours();

  isAvailable.value = hours >= 0 && hours < 18;
};

const showInfo = ref(true);

function removeAskingHistory() {
  localStorage.setItem("addressData", JSON.stringify(pvzData.value));
  localStorage.removeItem("isNotAskingOZ");
  localStorage.removeItem("isNotAskingWB");
  localStorage.removeItem("isNotAskingYM");

  isNotAskingWB.value = false;
  isNotAskingOZ.value = false;
  isNotAskingYM.value = false;
}

let isShowWarning = ref(false);

function showWarning() {
  isShowWarning.value = true;
  isOpen.value = false;
}

function unShowWarning() {
  isShowWarning.value = false;
  isOpen.value = true;
}

function signOut() {
  storeClients.signOut();
}

const phoneNumberData = ref("+7");

watch(() => phoneNumberData.value, validationPhoneNumber);
watch(() => pvzData.value, checkPercent);

function validationPhoneNumber() {
  phoneNumberData.value = phoneNumberData.value.replace(/[^0-9]/g, "");
  if (!phoneNumberData.value.startsWith("+7")) {
    phoneNumberData.value =
      "+7" + phoneNumberData.value.replace(/^(\+?7|8)?/, "");
  }

  if (phoneNumberData.value.length > 12) {
    phoneNumberData.value = phoneNumberData.value.slice(0, 12);
  }
}

let percentPVZ = ref({} as IPVZPercent);
const storePVZPercent = usePVZPercentStore();
async function checkPercent() {
  let pvzPercent = await storePVZPercent.getPVZ();

  if (pvzData.value) {
    percentPVZ.value = pvzPercent.find(
      (row: any) =>
        row.pvz.name === pvzData.value && row.flag === "ClientRansom"
    );
    if (rowData.value.productLink) {
      if (rowData.value.productLink === "Wildberries") {
        rowData.value.percentClient = percentPVZ.value.wb;
      } else if (rowData.value.productLink === "Ozon") {
        rowData.value.percentClient = percentPVZ.value.ozon;
      } else if (rowData.value.productLink === "Яндекс Маркет") {
        rowData.value.percentClient = percentPVZ.value.ym;
      }
    }
  }

  return pvzPercent;
}

const MPVZs = ref(["ПВЗ_8", "ППВЗ_9", "ПВЗ_10", "ПВЗ_11", "ППВЗ_12", "ПВЗ_14"]);

async function writeClipboardText(text: any) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error: any) {
    console.error(error.message);
  }
}
</script>

<template>
  <Head>
    <Title
      >Оформить доставку Вашего заказа из интернет-магазина по Штрих-коду
      (QR)</Title
    >
  </Head>
  <div v-if="!isLoading">
    <div>
      <div v-if="isOpenFirstModal">
        <div
          class="bg-[#0763f6cd] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200"
          @click="changeMarketplace('Ozon')"
        >
          <img
            src="@/assets/images/ozon-bg-1.png"
            class="max-w-[170px] max-sm:max-w-[130px] shadow-2xl shadow-black rounded-full"
            alt=""
          />
        </div>
        <div
          class="bg-gradient-to-r from-[#7c2570] via-[#bb3c95] to-[#ec208b] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200"
          @click="changeMarketplace('Wildberries')"
        >
          <img
            src="@/assets/images/wb.png"
            class="max-w-[470px] max-sm:max-w-[300px] z-[10]"
            alt=""
          />
        </div>
        <div
          class="bg-[#f8cf02] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200"
          @click="changeMarketplace('Яндекс Маркет')"
        >
          <img
            src="@/assets/images/ym.png"
            class="max-w-[470px] max-sm:max-w-[300px]"
            alt=""
          />
        </div>
        <a
          href="https://t.me/Svetlana_Darompro"
          target="_blank"
          class="bg-secondary-color h-[230px] max-sm:h-[200px] flex items-center justify-center cursor-pointer hover:opacity-70 duration-200"
        >
          <h1
            class="uppercase text-5xl max-sm:text-3xl font-bold text-white text-center"
          >
            Другой интернет-магазин
          </h1>
        </a>
      </div>
      <UModal
        :ui="{
          container: 'flex items-center justify-center text-center',
        }"
        v-auto-animate
        v-model="isOpen"
        prevent-close
        v-if="!isOpenFirstModal"
      >
        <div
          v-if="
            (isNotAskingWB && marketplace === 'Wildberries') ||
            (isNotAskingOZ && marketplace === 'Ozon') ||
            (isNotAskingYM && marketplace === 'Яндекс Маркет')
          "
          class="flex items-end justify-end"
        >
          <UButton
            v-if="showInfo"
            @click="showInfo = !showInfo"
            class="font-semibold m-2 max-w-[200px]"
            icon="bx:bxs-hide"
            >Скрыть</UButton
          >
          <UButton
            v-if="!showInfo"
            @click="showInfo = !showInfo"
            class="font-semibold m-2 max-w-[200px]"
            icon="ic:round-remove-red-eye"
            >Показать</UButton
          >
        </div>
        <div
          v-if="isNotAskingWB && marketplace === 'Wildberries' && showInfo"
          class="px-4 py-5 mb-5 sm:px-6 rounded-lg divide-y divide-gray-100 dark:divide-gray-800 shadow bg-white dark:bg-gray-900 z-[200]"
        >
          <div class="text-center max-sm:text-sm">
            <h1 class="text-xl font-semibold mb-1">
              Успешно выбран адрес заказа!
            </h1>
            Если Вы верно указали адрес, то можете заказывать товар и после
            уведомления о доставке по адресу: <br />
            <span
              v-if="!MPVZs.includes(pvzData)"
              class="text-[#ec208b] font-semibold text-center"
            >
              Ростовская область, Матвеево-Курганский район, Село Ряженое, Улица
              Ленина 6
            </span>
            <span
              v-if="MPVZs.includes(pvzData)"
              class="text-[#ec208b] font-semibold text-center"
            >
              Ростовская область, Матвеево-Курганский район, Село Латоново,
              Улица Ленина 67
            </span>
            <br />
            <span class="mt-1"
              >можете ниже прикрепить Штрих-код (QR) из приложения
              Wildberries</span
            >
          </div>
        </div>

        <div
          v-if="isNotAskingOZ && marketplace === 'Ozon' && showInfo"
          class="px-4 py-5 mb-5 sm:px-6 rounded-lg divide-y divide-gray-100 dark:divide-gray-800 shadow bg-white dark:bg-gray-900 z-[200]"
        >
          <div class="text-center max-sm:text-sm">
            <h1 class="text-xl font-semibold mb-1">
              Успешно выбран адрес заказа!
            </h1>
            Если Вы верно указали адрес, то можете заказывать товар и после
            уведомления о доставке по адресу: <br />
            <span
              v-if="!MPVZs.includes(pvzData)"
              class="text-[#005df6] font-semibold text-center"
            >
              Ростовская область, Матвеево-Курганский район, Село Ряженое, Улица
              Ленина 6
            </span>
            <span
              v-if="MPVZs.includes(pvzData)"
              class="text-[#005df6] font-semibold text-center"
            >
              Ростовская область, Матвеево-Курганский район, Село Латоново,
              Улица Ленина 67
            </span>
            <br />
            <span class="mt-1"
              >можете ниже прикрепить Штрих-код (QR) из приложения Ozon</span
            >
          </div>
        </div>

        <div
          v-if="isNotAskingYM && marketplace === 'Яндекс Маркет' && showInfo"
          class="px-4 py-5 mb-5 sm:px-6 rounded-lg divide-y divide-gray-100 dark:divide-gray-800 shadow bg-white dark:bg-gray-900 z-[200]"
        >
          <div class="text-center max-sm:text-sm">
            <h1 class="text-xl font-semibold mb-1">
              Успешно выбран адрес заказа!
            </h1>
            Если Вы верно указали адрес, то можете заказывать товар и после
            уведомления о доставке по адресу: <br />
            <span class="text-[#f8cf02] font-semibold text-center">
              Ростовская область, Матвеево-Курганский район, Село Ряженое, Улица
              Ленина 6
            </span>
            <br />
            <span class="mt-1"
              >можете ниже прикрепить Штрих-код (QR) из приложения Яндекс
              Маркет</span
            >
          </div>
        </div>

        <UCard
          v-auto-animate
          :ui="{
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3
                v-if="!isOpenLastModal"
                class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Заполните информацию
              </h3>
              <h3
                v-if="isOpenLastModal"
                class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Проверьте информацию
              </h3>
            </div>
          </template>

          <div v-auto-animate="{ easing: 'ease-out' }">
            <div class="h-[120px]" v-if="isOpenSecondModal" v-auto-animate>
              <label>Пункт выдачи заказов</label>
              <USelectMenu
                value-attribute="pvz"
                option-attribute="name"
                v-model="pvzData"
                :options="pvzs"
                class="mt-3"
              />
              <div class="mt-5 flex justify-end gap-3" v-auto-animate>
                <UButton
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showFirstModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="pvzData"
                  @click="showThirdModal()"
                  class="font-bold"
                  label="ДАЛЕЕ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div v-if="isOpenThirdModal" v-auto-animate>
              <div
                class="flex items-center justify-between max-[460px]:flex-col max-sm:gap-3 max-sm:items-start"
              >
                <label>Пункт выдачи заказов</label>
              </div>
              <div
                class="flex mb-3 mt-3 items-center justify-between gap-2 max-[460px]:flex-col max-[460px]:items-start"
              >
                <USelectMenu
                  @change="removeAskingHistory"
                  value-attribute="pvz"
                  option-attribute="name"
                  v-model="pvzData"
                  :options="pvzs"
                  class="w-full"
                />
              </div>

              <div v-if="marketplace === 'Wildberries'">
                <UButton
                  v-if="!isNotAskingWB"
                  icon="i-mdi:package-variant-closed-check"
                  color="pink"
                  class="duration-200 text-left font-semibold mb-3"
                  @click="router.push(`/order/independently/wb`)"
                  >Нажмите сюда, чтобы посмотреть инструкцию и указать адрес в
                  приложении
                </UButton>

                <div
                  v-if="!MPVZs.includes(pvzData)"
                  class="bg-gray-100 font-semibold rounded-xl p-3 flex items-center justify-center flex-col"
                >
                  <h1 class="text-sm font-semibold">
                    Село Ряженое, Улица Ленина 6
                  </h1>
                  <UButton
                    @click="writeClipboardText('Село Ряженое, Улица Ленина 6')"
                    target="_blank"
                    icon="i-material-symbols-content-copy"
                    size="sm"
                    color="pink"
                    variant="solid"
                    class="font-semibold duration-200 mt-3"
                    :trailing="false"
                    >Скопировать адрес</UButton
                  >
                </div>
                <div
                  v-if="MPVZs.includes(pvzData)"
                  class="bg-gray-100 font-semibold rounded-xl p-3 flex items-center justify-center flex-col"
                >
                  <h1 class="text-sm font-semibold">
                    Село Латоново, Улица Ленина 67
                  </h1>
                  <UButton
                    @click="
                      writeClipboardText('Село Латоново, Улица Ленина 67')
                    "
                    target="_blank"
                    icon="i-material-symbols-content-copy"
                    size="sm"
                    color="pink"
                    variant="solid"
                    class="font-semibold duration-200 mt-3"
                    :trailing="false"
                    >Скопировать адрес</UButton
                  >
                </div>
              </div>
              <div v-if="marketplace === 'Ozon'">
                <UButton
                  v-if="!isNotAskingOZ"
                  icon="i-mdi:package-variant-closed-check"
                  color="blue"
                  class="duration-200 text-left font-semibold mb-3 w-full"
                  @click="router.push(`/order/independently/ozon`)"
                  >Нажмите сюда, чтобы указать адрес в приложении
                </UButton>

                <div
                  v-if="!MPVZs.includes(pvzData)"
                  class="bg-gray-100 font-semibold rounded-xl p-3 flex items-center justify-center flex-col"
                >
                  <h1 class="text-sm font-semibold">
                    Село Ряженое, Улица Ленина 6
                  </h1>
                </div>
                <div
                  v-if="MPVZs.includes(pvzData)"
                  class="bg-gray-100 font-semibold rounded-xl p-3 flex items-center justify-center flex-col"
                >
                  <h1 class="text-sm font-semibold">
                    Село Латоново, Улица Ленина 67
                  </h1>
                </div>
              </div>
              <div v-if="marketplace === 'Яндекс Маркет'">
                <UButton
                  v-if="!isNotAskingYM"
                  icon="i-mdi:package-variant-closed-check"
                  color="yellow"
                  class="duration-200 text-left font-semibold mb-3"
                  @click="router.push(`/order/independently/ym`)"
                  >Нажмите сюда, чтобы посмотреть инструкцию и указать адрес в
                  приложении
                </UButton>

                <div
                  class="bg-gray-100 font-semibold rounded-xl p-3 flex items-center justify-center flex-col"
                >
                  <h1 class="text-sm font-semibold">
                    Село Ряженое, Улица Ленина 6
                  </h1>
                  <UButton
                    @click="writeClipboardText('Село Ряженое, Улица Ленина 6')"
                    target="_blank"
                    icon="i-material-symbols-content-copy"
                    size="sm"
                    color="yellow"
                    variant="solid"
                    class="font-semibold duration-200 mt-3"
                    :trailing="false"
                    >Скопировать адрес</UButton
                  >
                </div>
              </div>
              <label>Прикрепите скриншот Штрих-кода*</label>
              <div v-if="!rowData.img" class="h-[44px]">
                <UInput
                  @change="uploadQRFile"
                  class="w-full mt-3"
                  type="file"
                  color="gray"
                  variant="outline"
                  size="sm"
                  icon="i-heroicons-folder"
                  accept="image/*"
                />
              </div>
              <div
                v-else
                class="flex items-center justify-between gap-3 relative w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 file:font-medium file:text-gray-500 dark:file:text-gray-400 file:bg-transparent file:border-0 file:p-0 file:outline-none text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 mt-3"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    name="icon-park-solid:folder-success"
                    size="24"
                    class="text-green-500"
                  />
                  <h1>Файл загружен</h1>
                </div>
                <div class="flex justify-end">
                  <UButton
                    v-if="rowData.img"
                    @click="clearQRPhoto"
                    class="font-bold"
                    size="xs"
                    color="red"
                  >
                    <template #trailing>
                      <UIcon
                        name="bitcoin-icons:cross-filled"
                        class="w-4 h-4"
                      />
                    </template>
                  </UButton>
                </div>
              </div>
              <h1 class="text-sm text-center mt-2">
                Прикрепить штрих-код можно с 00:00 до 18:00
              </h1>
              <h1 class="text-sm italic text-center mt-1">
                *штрих-код обновляется каждые 24 часа в 00:00
              </h1>
              <h1
                v-if="percentPVZ.ozon === 0 && marketplace === 'Ozon'"
                class="text-sm italic text-center mt-1"
              >
                *Ozon - 5%, если вес товара от 25кг
              </h1>
              <div class="mt-5 flex justify-end gap-3" v-auto-animate>
                <UButton
                  v-if="!pvzData"
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showSecondModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="pvzData"
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showFirstModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="rowData.img"
                  @click="showFourModal()"
                  class="font-bold"
                  label="ДАЛЕЕ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div class="h-[120px]" v-if="isOpenFourModal" v-auto-animate>
              <label>Номер телефона (формат +7XXXXXXXXXX)</label>
              <input
                v-model="phoneNumberData"
                id="phone"
                name="phone"
                type="text"
                autocomplete="phone"
                required
                placeholder="+7XXXXXXXXXX"
                @input="validationPhoneNumber"
                class="relative block mt-3 w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              />
              <div class="mt-5 flex justify-end gap-3" v-auto-animate>
                <UButton
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showThirdModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="phoneNumberData.length === 12"
                  @click="showLastModal()"
                  class="font-bold"
                  label="ДАЛЕЕ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div v-if="isOpenLastModal" v-auto-animate>
              <h1 class="text-sm text-left">
                Чтобы мы доставили ваш заказ, он должен быть оформлен на адрес:
                <br />
              </h1>
              <h1
                v-if="!MPVZs.includes(pvzData)"
                class="italic font-bold text-left"
              >
                Ростовская область, Матвеево-Курганский район, <br />
                с. Ряженое, ул Ленина 6*
              </h1>
              <h1
                v-if="MPVZs.includes(pvzData)"
                class="italic font-bold text-left"
              >
                Ростовская область, Матвеево-Курганский район, Село Латоново,
                Улица Ленина 67*
              </h1>
              <div class="space-y-3 my-5">
                <h1
                  class="grid grid-cols-2 border-b-[1px] pb-2 border-secondary-color"
                >
                  Интернет-магазин <span> {{ marketplace }}</span>
                </h1>
              </div>
              <div class="space-y-3 my-5">
                <h1
                  class="grid grid-cols-2 border-b-[1px] pb-2 border-secondary-color"
                >
                  Пункт выдачи
                  <span>
                    {{ pvzs.find((row) => row.pvz === pvzData)?.name }}</span
                  >
                </h1>
              </div>
              <div class="space-y-3 my-5">
                <h1
                  class="grid grid-cols-2 border-b-[1px] pb-2 border-secondary-color"
                >
                  Номер телефона <span> {{ phoneNumberData }}</span>
                </h1>
              </div>
              <div class="space-y-3 my-5">
                <h1
                  class="grid grid-cols-2 border-b-[1px] pb-2 border-secondary-color"
                >
                  Штрих-код
                  <span>
                    {{ rowData.img ? "Прикреплён" : "Не прикреплён" }}</span
                  >
                </h1>
              </div>

              <div class="mt-5 flex justify-end gap-3" v-auto-animate>
                <UButton
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showFourModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  @click="submitForm()"
                  class="font-bold"
                  label="ОТПРАВИТЬ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </UModal>

      <div>
        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isShowModal"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Статус доставки
                </h3>
                <Icon
                  @click="isShowModal = !isShowModal"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div class="text-center">
              <h1
                class="text-2xl text-center text-green-500 font-bold uppercase w-full max-sm:text-xl"
              >
                Ваш заказ успешно оформлен!
              </h1>

              <div class="">
                <h1 class="text-xl max-sm:text-lg max-sm:text-center mt-2 mb-5">
                  Ориентировочное время доставки:
                  <span class="text-secondary-color font-bold"> 2 дня</span>
                </h1>
              </div>

              <h1>
                Информацию о статусе заказа можно посмотреть по
                <a
                  target="_blank"
                  class="underline text-secondary-color font-semibold"
                  :href="linkToClient"
                  >ссылке</a
                >
              </h1>
              <div>
                <h1 class="text-center italic mt-1">
                  Обязательно сохраните эту
                  <a
                    target="_blank"
                    class="underline text-secondary-color font-semibold"
                    :href="linkToClient"
                    >ссылку</a
                  >, чтобы отслеживать статус доставки!
                </h1>
              </div>

              <div class="flex items-center flex-col mt-3">
                <h1 class="text-center font-semibold">
                  Если хотите получить полный функционал, то Вы можете
                </h1>
                <UButton
                  @click="router.push(`/auth/client`)"
                  class="mt-3 mx-auto text-center flex items-center justify-center font-semibold uppercase"
                  >Зарегистрироваться</UButton
                >
              </div>
            </div>
          </UCard>
        </UModal>
      </div>

      <div>
        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isShowWarning"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Авторизация
                </h3>
                <Icon
                  @click="unShowWarning"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div class="text-center">
              <h1>
                После входа вам будет доступен полный функционал личного
                кабинета!
              </h1>
              <div class="max-md:flex items-center justify-center">
                <UButton
                  v-if="marketplace === 'Wildberries'"
                  @click="router.push(`/auth/client?marketplace=wb`)"
                  class="my-3 font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
                <UButton
                  v-if="marketplace === 'Ozon'"
                  @click="router.push(`/auth/client?marketplace=ozon`)"
                  class="my-3 font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
                <UButton
                  v-if="marketplace === 'Яндекс Маркет'"
                  @click="router.push(`/auth/client?marketplace=ym`)"
                  class="my-3 font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
              </div>
            </div>
          </UCard>
        </UModal>
      </div>
    </div>
  </div>

  <div v-else class="w-screen">
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
