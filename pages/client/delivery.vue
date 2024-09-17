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

const storeCells = useCellsStore();

let originallyRows = ref<Array<IOurRansom>>();
let cells = ref<Array<Cell>>();
let cellData = ref({} as Cell);
let marketplaceData = route.query.marketplace;
onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }

  const storedFileName = localStorage.getItem("fileName");
  if (storedFileName) {
    localStorage.removeItem("fileName");
  }

  const storedMarketplace = localStorage.getItem("marketplace");
  if (storedMarketplace) {
    marketplace.value = JSON.parse(storedMarketplace);
  }

  if (route.query.qr === "true") {
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    showThirdModal();
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();
  originallyRows.value = await storeRansom.getRansomRowsForModalClientRansom();
  cells.value = await storeCells.getCellsClient();
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
  let rowsWithDeleted =
    await storeRansom.getRansomRowsWithDeletedForCellsOurRansom();
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
  if (rowData.value.fromName.trim().length === 12) {
    let row = originallyRows.value?.filter(
      (row) =>
        row.fromName === rowData.value.fromName &&
        row.dispatchPVZ === pvzData.value &&
        (row.deliveredPVZ === null ||
          row.deliveredSC === null ||
          row.issued === null) &&
        !row.cell.includes("-")
    );

    if (row && row.length > 0) {
      const unoccupiedCellsAndPVZ = cells.value?.sort(
        (a, b) => a.name - b.name
      );
      const freeCell = unoccupiedCellsAndPVZ?.find(
        (cell) => cell.PVZ === pvzData.value && cell.status === "Свободно"
      );

      const targetCell = row[0].cell;
      const targetPVZ = row[0].dispatchPVZ;
      const targetFromName = row[0].fromName;

      const cellIsOccupied = unoccupiedCellsAndPVZ?.some(
        (cell) =>
          cell.name === targetCell &&
          cell.PVZ === targetPVZ &&
          cell.fromName !== targetFromName
      );

      if (cellIsOccupied) {
        if (freeCell) {
          rowData.value.cell = freeCell.name;
          cellData.value = freeCell;
        } else {
          toast.warning("Нет свободных ячеек для выбранного ПВЗ");
        }
      } else {
        rowData.value.cell = row[0].cell;
      }
    } else {
      const unoccupiedCellsAndPVZ = cells.value
        ?.filter((cell) => cell.status === "Свободно")
        .sort((a, b) => a.name - b.name);
      const freeCell = unoccupiedCellsAndPVZ?.find(
        (cell) => cell.PVZ === pvzData.value
      );
      if (freeCell) {
        rowData.value.cell = freeCell.name;
        cellData.value = freeCell;
      } else {
        toast.warning("Нет свободных ячеек для выбранного ПВЗ");
      }
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
  rowData.value.img = `${randomDigits}-${fileName}`;
  fileQRPhoto.value = e[0];
  localStorage.setItem("fileName", JSON.stringify(rowData.value.img));
  localStorage.setItem("marketplace", JSON.stringify(marketplace.value));
}

let isOpen = ref(true);

const people = [
  {
    pvz: "ПВЗ_1",
    name: "г. Донецк, ул. Антропова 16",
  },
  {
    pvz: "ПВЗ_3",
    name: "г. Донецк, ул. Палладина, 20",
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
    pvz: "ППВЗ_7",
    name: "г. Донецк, ул. Жебелева, д. 7",
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
    rowData.value.fromName = user.value.phoneNumber;
    rowData.value.productLink = marketplace.value;
    rowData.value.dispatchPVZ = pvzData.value;
    if (phoneNumbersWithoutPercent.value.includes(user.value.phoneNumber)) {
      rowData.value.percentClient = 0;
    }
    getCellFromName();

    isLoading.value = true;

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
      "Выкуп Клиента: Darom.pro",
      `Прикреплён новый штрих-код`,
      "Волошина"
    );

    localStorage.removeItem("fileName");
    localStorage.removeItem("marketplace");

    setTimeout(() => {
      router.push("/client/main");
    }, 3000);
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
</script>

<template>
  <Head>
    <Title>Доставить мой заказ</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
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
                :options="people"
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
              <h1 class="text-sm italic text-center mt-2">
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
                    {{ people.find((row) => row.pvz === pvzData)?.name }}</span
                  >
                </h1>
              </div>
              <div class="space-y-3 my-5">
                <h1
                  class="grid grid-cols-2 border-b-[1px] pb-2 border-secondary-color"
                >
                  Штрих-код <span> {{ rowData.img }}</span>
                </h1>
              </div>
              <h1 class="text-sm text-center">
                Чтобы мы получили ваш заказ, он должен быть оформлен на адрес:
                <br />
                <span class="italic font-bold">
                  Ростовская область, Матвеево-Курганский район, <br />
                  с. Ряженое, ул Ленина 6*</span
                >
              </h1>
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
                class="font-bold"
                icon="i-material-symbols-shopping-cart"
                size="xl"
                >МОИ ЗАКАЗЫ</UButton
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
    </div>
  </div>
  <div v-else class="w-screen">
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
