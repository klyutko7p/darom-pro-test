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
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }

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
  await checkPercent();
  cells.value = await storeCells.getCellsClient();

  originallyRows.value = await storeRansom.getRansomRowsForModalClientRansom();
  pvzData.value = localStorage.getItem("addressData") || "";
  pvzData.value = pvzData.value.replace(/"/g, "");
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
  layout: "client-no-pad",
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
  isOpenLastModal.value = false;
}
function showLastModal() {
  isOpenThirdModal.value = false;
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
    name: "ул. 8 Марта, 77",
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
    name: "ул. Центральная, 43",
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

async function submitForm() {
  try {
    if (pvzData.value) {
      rowData.value.orderPVZ = "Ряженое";
      rowData.value.fromName = user.value.phoneNumber;
      rowData.value.productLink = marketplace.value;
      rowData.value.dispatchPVZ = pvzData.value;

      isLoading.value = true;

      await checkPercent();

      if (phoneNumbersWithoutPercent.value.includes(user.value.phoneNumber)) {
        rowData.value.percentClient = 0;
      }

      getCellFromName();

      const filePromises = [handleFile("image", fileQRPhoto.value)];

      await Promise.all(filePromises);

      await storeRansom.createRansomRow(
        rowData.value,
        user.value.phoneNumber,
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

      setTimeout(() => {
        router.push("/client/main?notification=false");
      }, 3000);
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
    <div v-if="token">
      <div v-if="isOpenFirstModal">
        <div
          class="bg-[#0763f6cd] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200 relative"
          @click="changeMarketplace('Ozon')"
        >
          <div
            class="w-[470px] max-sm:w-[300px] flex items-center justify-center"
          >
            <img
              src="@/assets/images/ozon-bg-1.png"
              class="max-w-[170px] max-sm:max-w-[130px] shadow-2xl shadow-black rounded-full"
              alt=""
            />
          </div>

          <div
            v-if="percentPVZ.ozon"
            class="relative text-2xl max-sm:text-2xl w-24 h-24 bg-[#f92160] rounded-full flex justify-center font-bold text-white items-center text-center p-5 shadow-xl max-[430px]:absolute max-[430px]:right-3 max-[430px]:top-4 max-[430px]:w-16 max-[430px]:h-16 max-[430px]:text-base max-[430px]:p-3"
          >
            {{ percentPVZ.ozon }} %
          </div>
        </div>
        <div
          class="bg-gradient-to-r from-[#7c2570] via-[#bb3c95] to-[#ec208b] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200 relative"
          @click="changeMarketplace('Wildberries')"
        >
          <img
            src="@/assets/images/wb.png"
            class="max-w-[470px] max-sm:max-w-[300px] z-[10]"
            alt=""
          />

          <div
            v-if="percentPVZ.wb"
            class="relative text-2xl max-sm:text-2xl w-24 h-24 bg-[#7b256f] rounded-full flex justify-center font-bold text-white items-center text-center p-5 shadow-xl max-[430px]:absolute max-[430px]:right-3 max-[430px]:top-2 max-[430px]:w-16 max-[430px]:h-16 max-[430px]:text-base max-[430px]:p-3"
          >
            {{ percentPVZ.wb }} %
          </div>
        </div>
        <div
          class="bg-[#f8cf02] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200 relative"
          @click="changeMarketplace('Яндекс Маркет')"
        >
          <img
            src="@/assets/images/ym.png"
            class="max-w-[470px] max-sm:max-w-[300px]"
            alt=""
          />

          <div
            v-if="percentPVZ.ym"
            class="relative text-2xl max-sm:text-2xl w-24 h-24 bg-[#232323] rounded-full flex justify-center font-bold text-white items-center text-center p-5 shadow-xl max-[430px]:absolute max-[430px]:right-3 max-[430px]:top-4 max-[430px]:w-16 max-[430px]:h-16 max-[430px]:text-base max-[430px]:p-3"
          >
            {{ percentPVZ.ym }} %
          </div>
        </div>
        <a
          href="https://t.me/Svetlana_Darompro"
          target="_blank"
          class="bg-secondary-color h-[230px] max-sm:h-[200px] flex items-center justify-center cursor-pointer hover:opacity-70 duration-200 flex-col"
        >
          <h1
            class="uppercase text-5xl max-sm:text-3xl font-bold text-white text-center"
          >
            Другой интернет-магазин
          </h1>
          <h1 class="text-2xl max-sm:text-lg text-white font-bold">
            % уточните у администратора
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
              v-if="pvzData !== 'ПВЗ_8' && pvzData !== 'ПВЗ_10'"
              class="text-[#ec208b] font-semibold text-center"
            >
              Ростовская область, Матвеево-Курганский район, Село Ряженое, Улица
              Ленина 6
            </span>
            <span
              v-if="pvzData === 'ПВЗ_8' || pvzData === 'ПВЗ_10'"
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
              v-if="pvzData !== 'ПВЗ_8' && pvzData !== 'ПВЗ_10'"
              class="text-[#005df6] font-semibold text-center"
            >
              Ростовская область, Матвеево-Курганский район, Село Ряженое, Улица
              Ленина 6
            </span>
            <span
              v-if="pvzData === 'ПВЗ_8' || pvzData === 'ПВЗ_10'"
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
                <UButton
                  v-if="marketplace === 'Wildberries'"
                  icon="i-material-symbols-add-location"
                  size="sm"
                  @click="
                    router.push(
                      '/client/order/independently/ozon?change=true&delivery=true&marketplace=wb'
                    )
                  "
                  class="font-bold duration-200 max-[460px]:w-full flex items-center justify-center"
                  color="pink"
                  variant="solid"
                  label="Выбрать на карте"
                  :trailing="false"
                />
                <UButton
                  v-if="marketplace === 'Ozon'"
                  icon="i-material-symbols-add-location"
                  size="sm"
                  @click="
                    router.push(
                      '/client/order/independently/ozon?change=true&delivery=true&marketplace=ozon'
                    )
                  "
                  class="font-bold max-[460px]:w-full flex items-center justify-center duration-200"
                  color="blue"
                  variant="solid"
                  label="Выбрать на карте"
                  :trailing="false"
                />
                <UButton
                  v-if="marketplace === 'Яндекс Маркет'"
                  icon="i-material-symbols-add-location"
                  size="sm"
                  @click="
                    router.push(
                      '/client/order/independently/ozon?change=true&delivery=true&marketplace=ym'
                    )
                  "
                  class="font-bold max-[460px]:w-full flex items-center justify-centerduration-200"
                  color="yellow"
                  variant="solid"
                  label="Выбрать на карте"
                  :trailing="false"
                />
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
                  @click="router.push(`/client/order/independently/wb`)"
                  >Нажмите сюда, чтобы посмотреть куда заказать для дальнейшей
                  доставки в пункт выдачи заказов
                  {{ pvzs.find((row) => row.pvz === pvzData)?.name }}
                </UButton>
              </div>
              <div v-if="marketplace === 'Ozon'">
                <UButton
                  v-if="!isNotAskingOZ"
                  icon="i-mdi:package-variant-closed-check"
                  color="blue"
                  class="duration-200 text-left font-semibold mb-3"
                  @click="router.push(`/client/order/independently/ozon`)"
                  >Нажмите сюда, чтобы посмотреть куда заказать для дальнейшей
                  доставки в пункт выдачи заказов
                  {{ pvzs.find((row) => row.pvz === pvzData)?.name }}
                </UButton>
              </div>
              <div v-if="marketplace === 'Яндекс Маркет'">
                <UButton
                  v-if="!isNotAskingYM"
                  icon="i-mdi:package-variant-closed-check"
                  color="yellow"
                  class="duration-200 text-left font-semibold mb-3"
                  @click="router.push(`/client/order/independently/ym`)"
                  >Нажмите сюда, чтобы посмотреть куда заказать для дальнейшей
                  доставки в пункт выдачи заказов
                  {{ pvzs.find((row) => row.pvz === pvzData)?.name }}
                </UButton>
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
                v-if="pvzData !== 'ПВЗ_8' && pvzData !== 'ПВЗ_10'"
                class="italic font-bold text-left"
              >
                Ростовская область, Матвеево-Курганский район, <br />
                с. Ряженое, ул Ленина 6*
              </h1>
              <h1
                v-if="pvzData === 'ПВЗ_8' || pvzData === 'ПВЗ_10'"
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
                  @click="showThirdModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="user.phoneNumber !== '+70000000001'"
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
                <UButton
                  v-if="user.phoneNumber === '+70000000001'"
                  @click="showWarning()"
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
      <div
        v-auto-animate
        v-if="isShowModal"
        class="fixed top-0 bottom-0 left-0 bg-black bg-opacity-70 right-0 z-[100]"
      >
        <div
          class="flex items-center justify-center h-screen text-black font-semibold"
        >
          <div
            class="bg-white relative p-10 max-sm:p-3 rounded-lg flex items-center flex-col gap-3"
          >
            <div class="absolute top-4 right-4 max-sm:top-2 max-sm:right-2">
              <Icon
                name="material-symbols:cancel-rounded"
                size="32"
                class="cursor-pointer hover:text-secondary-color duration-200"
                @click="isShowModal = !isShowModal"
              />
            </div>
            <h1
              class="text-2xl text-center text-green-500 font-bold uppercase border-b-2 border-black w-full mb-3 max-sm:text-xl py-3 max-sm:mt-5"
            >
              Ваш заказ успешно оформлен!
            </h1>
            <div class="flex items-center gap-3 max-sm:flex-col">
              <h1 class="text-xl max-sm:text-lg max-sm:text-center">
                Информация о статусе заказа в
              </h1>
              <UButton
                @click="router.push('/client/my-orders')"
                class="font-bold uppercase"
                icon="i-material-symbols-shopping-cart"
                size="xl"
                >Мои заказы</UButton
              >
            </div>
            <div class="flex items-center gap-3 max-sm:flex-col">
              <h1 class="text-xl max-sm:text-lg max-sm:text-center">
                Ориентировочное время доставки:
                <span class="text-secondary-color font-bold"> 2 дня</span>
              </h1>
            </div>
          </div>
        </div>
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
              <h1 class="mb-2">
                После входа вам будет доступен полный функционал личного
                кабинета!
              </h1>
              <div class="flex items-center justify-center flex-col">
                <UButton
                  v-if="marketplace === 'Wildberries'"
                  @click="router.push(`/auth/client?marketplace=wb`)"
                  class="my-1 w-full text-center flex items-center justify-center font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
                <UButton
                  v-if="marketplace === 'Ozon'"
                  @click="router.push(`/auth/client?marketplace=ozon`)"
                  class="my-1 w-full text-center flex items-center justify-center font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
                <UButton
                  v-if="marketplace === 'Яндекс Маркет'"
                  @click="router.push(`/auth/client?marketplace=ym`)"
                  class="my-1 w-full text-center flex items-center justify-center font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
                <UButton
                  v-if="marketplace === 'Wildberries'"
                  @click="router.push(`/delivery?marketplace=wb`)"
                  class="my-1 w-full text-center flex items-center justify-center font-semibold uppercase"
                  >Доставка в один клик</UButton
                >
                <UButton
                  v-if="marketplace === 'Ozon'"
                  @click="router.push(`/delivery?marketplace=ozon`)"
                  class="my-1 w-full text-center flex items-center justify-center font-semibold uppercase"
                  >Доставка в один клик</UButton
                >
                <UButton
                  v-if="marketplace === 'Яндекс Маркет'"
                  @click="router.push(`/delivery?marketplace=ym`)"
                  class="my-1 w-full text-center flex items-center justify-center font-semibold uppercase"
                  >Доставка в один клик</UButton
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
