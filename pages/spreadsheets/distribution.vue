<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZStore();
const storeSortingCenters = useSortingCentersStore();
const storeOrderAccounts = useOrderAccountStore();
const storeBoxes = useBoxesStore();

const router = useRouter();

let isLoading = ref(false);
let isLoadingTab = ref(false);

let user = ref({} as User);

let rows = ref<Array<IOurRansom>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();
let orderAccounts = ref<Array<OrderAccount>>();

const filteredRows = ref<Array<IOurRansom>>();

// function handleFilteredRows(filteredRowsData: IOurRansom[]) {
//   if (user.value.visiblePVZ === "ВСЕ" && user.value.visibleSC === "ВСЕ") {
//     filteredRows.value = filteredRowsData;
//   } else if (
//     user.value.visiblePVZ === "ВСЕ" &&
//     user.value.visibleSC !== "ВСЕ"
//   ) {
//     filteredRows.value = filteredRowsData.filter(
//       (row) => row.orderPVZ === user.value.visibleSC && row.deliveredSC !== null
//     );
//   } else if (
//     user.value.visiblePVZ !== "ВСЕ" &&
//     user.value.visibleSC === "ВСЕ"
//   ) {
//     filteredRows.value = filteredRowsData.filter(
//       (row) =>
//         user.value.PVZ.includes(row.dispatchPVZ) &&
//         row.deliveredSC !== null &&
//         row.verified === null
//     );
//   } else if (
//     user.value.visiblePVZ !== "ВСЕ" &&
//     user.value.visibleSC !== "ВСЕ"
//   ) {
//     filteredRows.value = filteredRowsData.filter(
//       (row) =>
//         user.value.PVZ.includes(row.dispatchPVZ) &&
//         row.orderPVZ === user.value.visibleSC &&
//         row.deliveredSC !== null
//     );
//   }

//   if (filteredRows.value) {
//     if (user.value.username === "Мешков" || user.value.username === "Шведова") {
//       filteredRows.value = filteredRows.value.filter(
//         (row) => row.dispatchPVZ && user.value.PVZ.includes(row.dispatchPVZ)
//       );
//     }
//   }
// }

const boxesScanned = ref<Array<Box>>([]);
const pvzsBoxesScanned = ref<Array<string>>([]);
const boxes = ref<Array<Box>>([]);
onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  boxes.value = await storeBoxes.getBoxes();

  let boxesJSON = localStorage.getItem("boxesScanned") as string;
  if (JSON.parse(boxesJSON)) {
    boxesScanned.value = JSON.parse(boxesJSON);
    pvzsBoxesScanned.value = boxesScanned.value.map((box) => box.dispatchPVZ);
  }

  if (user.value.role !== "COURIER") {
    pvzs = pvzs.filter((pvz) => user.value.PVZ.includes(pvz.name));
  }
  isLoading.value = false;
  if (!token) {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: "Распределение товара",
});

async function deleteRow(idData: number) {
  let answer = confirm("Вы точно хотите продолжить?");
  if (answer) {
    isLoadingTab.value = true;
    let deletedId = box.value.idRows.findIndex((id) => id === idData);
    box.value.idRows.splice(deletedId, 1);
    await storeBoxes.updateBox(box.value);
    boxes.value = await storeBoxes.getBoxes();
    isLoadingTab.value = false;
  }
}

async function deleteSelectedRows(idsData: number[]) {
  let answer = confirm("Вы точно хотите продолжить?");
  if (answer) {
    isLoadingTab.value = true;
    box.value.idRows = box.value.idRows.filter((id) => !idsData.includes(id));
    await storeBoxes.updateBox(box.value);
    boxes.value = await storeBoxes.getBoxes();
    isLoadingTab.value = false;
  }
}

const token = Cookies.get("token");

const items = [
  {
    slot: "box",
    label: "Создать коробку",
    icon: "i-lucide-package-plus",
  },
  {
    slot: "kgb",
    label: "Крупногабаритный товар",
    icon: "i-streamline-interface-edit-expand-big-bigger-design-expand-larger-resize-size-square",
  },
  {
    slot: "waiting",
    label: "Ожидание отгрузки",
    icon: "i-streamline-interface-time-reset-time-clock-reset-stopwatch-circle-measure-loading",
  },
];

const itemsCourier = [
  {
    slot: "scan",
    label: "Сканировать",
    icon: "i-material-symbols-barcode-scanner",
  },
  {
    slot: "delivery",
    label: "Доставка",
    icon: "i-mage-delivery-truck-fill",
  },
];

let pvzs = [
  {
    name: "ПВЗ_1",
    address: "ул. Антропова 16",
  },
  {
    name: "ПВЗ_2",
    address: "ул. Харитоново, 8",
  },
  {
    name: "ПВЗ_3",
    address: "ул. Палладина, 16",
  },
  {
    name: "ПВЗ_4",
    address: "ул. Нартова, 1",
  },
  {
    name: "ППВЗ_5",
    address: "ул. Дудинская, 4",
  },
  {
    name: "ПВЗ_8",
    address: "ул. Макара Мазая, 37А",
  },
  {
    name: "ППВЗ_9",
    address: "ул. 8 Марта, 77",
  },
  {
    name: "ПВЗ_10",
    address: "ул. Азовской Военной Флотилии, 2",
  },
  {
    name: "ПВЗ_11",
    address: "ул. Межевая",
  },
  {
    name: "ППВЗ_12",
    address: "ул. Центральная, 43",
  },
];

const selectedPVZ = ref({} as DistributionPVZ);

const isShowQR = ref(true);

function printPage() {
  for (let i = 0; i < quantityOfKGT.value; i++) {
    window.print();
  }

  isShowQR.value = false;
  isShowBoxItems.value = true;
}

const value = ref("");
const box = ref({} as Box);

function changeValue() {
  isShowQR.value = true;
  value.value = `https://darom.pro/box/${
    selectedPVZ.value.name.split("_")[1]
  }/${box.value.id}`;

  clearBox();
}

function changeBox() {
  selectedPVZ.value = pvzs.find((pvz) => box.value.dispatchPVZ === pvz.name);

  isShowQR.value = false;
  isShowBoxItems.value = true;

  value.value = `https://darom.pro/box/${
    selectedPVZ.value.name.split("_")[1]
  }/${box.value.id}`;
}

async function createBox(type: string) {
  isLoadingTab.value = true;
  let boxData = {
    dispatchPVZ: selectedPVZ.value.name,
    createdUser: user.value.username,
    type,
  } as Box;
  box.value = await storeBoxes.createBox(boxData);
  boxes.value = await storeBoxes.getBoxes();

  value.value = `https://darom.pro/box/${
    selectedPVZ.value.name.split("_")[1]
  }/${box.value.id}`;

  isLoadingTab.value = false;
}

const isShowBoxItems = ref(false);
const myInput = ref(null);

let scanStringItem = ref("");
let isScanActive = ref(false);

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function convertToURL(inputString: string) {
  if (inputString.includes("/")) {
    const parts = inputString.split("/");
    const entryID = parts[parts.length - 1];
    return entryID;
  } else if (inputString.includes(".")) {
    const parts = inputString.split(".");
    const entryID = parts[parts.length - 1];
    return entryID;
  }
}

async function scanItem() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(async () => {
    let scannedLink = scanStringItem.value.trim() as string;
    scannedLink = convertToURL(scannedLink);
    console.log(scannedLink);
    let item = await storeRansom.getRansomRowById(+scannedLink, "OurRansom");
    if (item.dispatchPVZ === selectedPVZ.value.name) {
      storeRansom.announce(`Товар в коробке`);
      toast.success("Товар в коробке!");
      box.value.idRows.push(+scannedLink);
      await storeBoxes.updateBox(box.value);
    } else {
      storeRansom.announce(`Ошибка. Товар не этого ПВЗ`);
      toast.error("Ошибка. Товар не этого ПВЗ!");
    }
  }, 1000);
}

function focusInput() {
  myInput.value.focus();
  isScanActive.value = true;
}

const myInputCourier = ref(null);
let scanStringItemCourier = ref("");

async function scanItemCourier() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(async () => {
    let scannedLink = scanStringItemCourier.value.trim();
    scannedLink = convertToURL(scannedLink);
    console.log(scannedLink);
    storeRansom.announce(`ID ${+scannedLink}`);
    box.value = await storeBoxes.getBoxById(+scannedLink);
    boxesScanned.value.push(box.value);

    if (!box.value.sorted) {
      box.value.sorted = new Date();
      await storeBoxes.updateBox(box.value);
      toast.success("У коробки изменён статус на «На курьере»!");
      localStorage.setItem("boxesScanned", JSON.stringify(boxesScanned.value));
      return;
    } else if (box.value.sorted && !box.value.delivered) {
      box.value.delivered = new Date();
      await storeBoxes.updateBox(box.value);
      toast.success("У коробки изменён статус на «Доставлено»!");
      localStorage.setItem("boxesScanned", JSON.stringify(boxesScanned.value));
      return;
    } else {
      toast.warning("Коробка уже доставлена!");
    }
  }, 1000);
}

function focusInputCourier() {
  myInputCourier.value.focus();
  isScanActive.value = true;
}

function clearBox() {
  box.value = {} as Box;
  quantityOfKGT.value = 1;
}

function closeBox() {
  let boxId = boxes.value.indexOf(box.value);
  boxes.value.splice(boxId, 1);
  clearBox();
  selectedPVZ.value = {} as DistributionPVZ;
}

const quantityOfKGT = ref(1);

let nameForShow = ref("");
function showBoxes(name: string) {
  if (nameForShow.value === name) {
    nameForShow.value = "";
  } else {
    nameForShow.value = name;
  }
}

function getNameFromPVZ(pvzData: string) {
  return pvzs.find((pvz) => pvz.name === pvzData)?.address;
}

function clearScannedBoxes() {
  boxesScanned.value = [];
  localStorage.setItem("boxesScanned", JSON.stringify(boxesScanned.value));
  pvzsBoxesScanned.value = [];
}
</script>

<template>
  <Head>
    <Title>Распределение товара</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div class="px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <UTabs @change="clearBox" :items="items" class="w-full">
            <template #icon="{ item, selected }">
              <UIcon
                :name="item.icon"
                class="w-4 h-4 flex-shrink-0 me-2"
                :class="[selected && 'text-primary-500 dark:text-primary-400']"
              />
            </template>

            <template #default="{ item, selected }">
              <span
                class="truncate"
                :class="[selected && 'text-secondary-color']"
                >{{ item.label }}</span
              >
            </template>

            <template #box="{ item }">
              <div
                v-if="!isLoadingTab"
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <div
                  class="flex max-sm:w-full items-start w-full max-sm:items-end gap-5 mt-3 mb-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Выберите коробку:</h1>

                    <select
                      @change="changeBox"
                      v-model="box"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option
                        :value="box"
                        v-for="box in boxes.filter(
                          (box) =>
                            box.type === 'standard' &&
                            !box.delivered &&
                            user.PVZ.includes(box.dispatchPVZ)
                        )"
                      >
                        ID: {{ box.id }}, {{ box.dispatchPVZ }},
                        {{ box.idRows.length }} шт.
                      </option>
                    </select>
                  </div>

                  <div v-if="box.id">
                    <UButton
                      @click="clearBox"
                      icon="i-akar-icons-cross"
                    ></UButton>
                  </div>
                </div>

                <div
                  class="flex max-sm:w-full items-center max-sm:items-end gap-5 mt-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Выберите ПВЗ:</h1>

                    <select
                      @change="changeValue"
                      v-model="selectedPVZ"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option :value="pvz" v-for="pvz in pvzs">
                        {{ pvz.name }}
                      </option>
                    </select>
                  </div>

                  <div v-if="box.id">
                    <UButton
                      v-if="selectedPVZ.name && !isShowQR"
                      @click="isShowQR = true"
                      icon="i-tabler-qrcode"
                    ></UButton>

                    <UButton
                      v-if="selectedPVZ.name && isShowQR"
                      @click="isShowQR = false"
                      icon="i-tabler-qrcode-off"
                    ></UButton>
                  </div>
                </div>

                <div class="mt-5" v-if="!box.id">
                  <UButton
                    class="font-semibold text-lg"
                    @click="createBox('standard')"
                    :disabled="!selectedPVZ.name"
                    icon="i-lucide-package-plus"
                    >Создать коробку
                  </UButton>
                </div>

                <div v-if="selectedPVZ.name && isShowQR && box.id">
                  <div class="flex items-center gap-5 mt-5">
                    <h1 class="text-2xl">Распечатка Штрих-кода</h1>
                    <UIMainButton @click="printPage"
                      >РАСПЕЧАТАТЬ ЭТИКЕТКУ</UIMainButton
                    >
                  </div>
                  <div class="flex flex-col print-content">
                    <div class="gap-0 flex flex-col mr-10">
                      <CodeQR :value="value" class="mt-10" />
                      <h1 class="text-4xl">
                        {{ box.id }}, {{ selectedPVZ.name }}
                      </h1>
                      <h1
                        class="text-6xl mt-2 text-center max-w-[500px] relative"
                      >
                        {{ selectedPVZ.address }}
                      </h1>
                    </div>
                  </div>
                </div>

                <div class="mt-5 px-3 w-full" v-if="isShowBoxItems && box.id">
                  <div class="flex items-center gap-5">
                    <UIMainButton @click="focusInput"
                      >СКАНИРОВАТЬ товары</UIMainButton
                    >
                    <Icon
                      v-if="isScanActive"
                      name="eos-icons:bubble-loading"
                      class="text-secondary-color"
                    />
                  </div>
                  <input
                    class="opacity-0"
                    ref="myInput"
                    autofocus
                    v-model="scanStringItem"
                    @input="scanItem"
                  />

                  <div class="flex items-start justify-start">
                    <div
                      class="flex items-center gap-3 max-sm:flex-col max-sm:items-start"
                    >
                      <div
                        class="flex items-center justify-center gap-3 bg-gray-200 rounded-md py-1 px-3"
                      >
                        <Icon name="i-tabler-package" size="24" />
                        <h1>
                          Коробка – {{ box.id }}, {{ box.idRows.length }} шт.
                        </h1>
                      </div>
                      <div>
                        <UButton
                          class="font-semibold text-sm"
                          @click="closeBox"
                          :disabled="!box.id"
                          icon="i-octicon-package-dependencies-16"
                          >Закрыть коробку
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <DistributionTable
                    @delete-row="deleteRow"
                    @delete-selected-rows="deleteSelectedRows"
                    :user="user"
                    :idRows="box.idRows"
                    :selectedPVZ="selectedPVZ"
                  />
                </div>
              </div>
              <div v-else>
                <UISpinnerModal />
              </div>
            </template>

            <template #kgb="{ item }">
              <div
                v-if="!isLoadingTab"
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <div
                  class="flex max-sm:w-full items-start w-full max-sm:items-end gap-5 mt-3 mb-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Выберите коробку c КГТ:</h1>

                    <select
                      @change="changeBox"
                      v-model="box"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option
                        :value="box"
                        v-for="box in boxes.filter(
                          (box) =>
                            box.type === 'KGT' &&
                            !box.delivered &&
                            user.PVZ.includes(box.dispatchPVZ)
                        )"
                      >
                        ID: {{ box.id }}, {{ box.dispatchPVZ }},
                        {{ box.idRows.length }} КГТ
                      </option>
                    </select>
                  </div>

                  <div v-if="box.id">
                    <UButton
                      @click="clearBox"
                      icon="i-akar-icons-cross"
                    ></UButton>
                  </div>
                </div>

                <div
                  class="flex max-sm:w-full items-center max-sm:items-end gap-5 mt-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base mr-2">Выберите ПВЗ:</h1>

                    <select
                      @change="changeValue"
                      v-model="selectedPVZ"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option :value="pvz" v-for="pvz in pvzs">
                        {{ pvz.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div
                  class="flex max-sm:w-full items-center max-sm:items-end gap-5 mt-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Количество КГТ:</h1>
                    <UInput
                      class="w-[300px] max-sm:w-full"
                      type="number"
                      v-model="quantityOfKGT"
                    />
                  </div>
                </div>

                <div v-if="box.id" class="mt-3">
                  <UButton
                    v-if="selectedPVZ.name && !isShowQR"
                    @click="isShowQR = true"
                    icon="i-tabler-qrcode"
                  ></UButton>

                  <UButton
                    v-if="selectedPVZ.name && isShowQR"
                    @click="isShowQR = false"
                    icon="i-tabler-qrcode-off"
                  ></UButton>
                </div>

                <div class="mt-5" v-if="!box.id && quantityOfKGT >= 1">
                  <UButton
                    class="font-semibold text-lg"
                    @click="createBox('KGT')"
                    :disabled="!selectedPVZ.name"
                    icon="i-lucide-package-plus"
                    >Создать коробку
                  </UButton>
                </div>

                <div v-if="selectedPVZ.name && isShowQR && box.id">
                  <div class="flex items-center gap-5 mt-5">
                    <h1 class="text-2xl">Распечатка Штрих-кода</h1>
                    <UIMainButton @click="printPage"
                      >РАСПЕЧАТАТЬ ЭТИКЕТКУ</UIMainButton
                    >
                  </div>
                  <div class="flex flex-col print-content">
                    <div class="gap-0 flex flex-col mr-10">
                      <CodeQR2 :value="value" class="mt-10" />
                      <h1 class="text-4xl">
                        {{ box.id }}, {{ selectedPVZ.name }}
                      </h1>
                      <h1
                        class="text-8xl mt-2 text-center max-w-[1000px] relative"
                      >
                        {{ selectedPVZ.address }}
                      </h1>
                    </div>
                  </div>
                </div>

                <div class="mt-5 px-3 w-full" v-if="isShowBoxItems && box.id">
                  <div class="flex items-center gap-5">
                    <UIMainButton @click="focusInput"
                      >СКАНИРОВАТЬ товары</UIMainButton
                    >
                    <Icon
                      v-if="isScanActive"
                      name="eos-icons:bubble-loading"
                      class="text-secondary-color"
                    />
                  </div>
                  <input
                    class="opacity-0"
                    ref="myInput"
                    autofocus
                    v-model="scanStringItem"
                    @input="scanItem"
                  />

                  <div class="flex items-start justify-start">
                    <div
                      class="flex items-center gap-3 max-sm:flex-col max-sm:items-start"
                    >
                      <div
                        class="flex items-center justify-center gap-3 bg-gray-200 rounded-md py-1 px-3"
                      >
                        <Icon name="i-tabler-package" size="24" />
                        <h1>
                          Коробка – {{ box.id }}, {{ box.idRows.length }} шт.
                        </h1>
                      </div>
                      <div>
                        <UButton
                          class="font-semibold text-sm"
                          @click="closeBox"
                          :disabled="!box.id"
                          icon="i-octicon-package-dependencies-16"
                          >Закрыть коробку
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <DistributionTable
                    @delete-row="deleteRow"
                    @delete-selected-rows="deleteSelectedRows"
                    :user="user"
                    :idRows="box.idRows"
                    :selectedPVZ="selectedPVZ"
                  />
                </div>
              </div>
              <div v-else>
                <UISpinnerModal />
              </div>
            </template>

            <template #waiting="{ item }">
              <div
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <DistributionBoxesTable
                  v-if="
                    user.username === 'Шведова' || user.username === 'Мешков'
                  "
                  class="w-full px-5"
                  @delete-row="deleteRow"
                  :user="user"
                  :boxes="
                    boxes.filter((box) => user.PVZ.includes(box.dispatchPVZ))
                  "
                />

                <DistributionBoxesTable
                  v-if="
                    user.username === 'Горцуева' ||
                    user.username === 'Власенкова' ||
                    user.username === 'Директор'
                  "
                  class="w-full px-5"
                  @delete-row="deleteRow"
                  :user="user"
                  :boxes="boxes"
                />

                <DistributionBoxesTable
                  v-else
                  class="w-full px-5"
                  @delete-row="deleteRow"
                  :user="user"
                  :boxes="
                    boxes.filter((box) => box.createdUser === user.username)
                  "
                />
              </div>
            </template>
          </UTabs>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="table-user-no-pad">
        <div class="px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <UTabs
            v-if="user.role !== 'COURIER'"
            @change="clearBox"
            :items="items"
            class="w-full"
          >
            <template #icon="{ item, selected }">
              <UIcon
                :name="item.icon"
                class="w-4 h-4 flex-shrink-0 me-2"
                :class="[selected && 'text-primary-500 dark:text-primary-400']"
              />
            </template>

            <template #default="{ item, selected }">
              <span
                class="truncate"
                :class="[selected && 'text-secondary-color']"
                >{{ item.label }}</span
              >
            </template>

            <template #box="{ item }">
              <div
                v-if="!isLoadingTab"
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <div
                  class="flex max-sm:w-full items-start w-full max-sm:items-end gap-5 mt-3 mb-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Выберите коробку:</h1>

                    <select
                      @change="changeBox"
                      v-model="box"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option
                        :value="box"
                        v-for="box in boxes.filter(
                          (box) =>
                            box.type === 'standard' &&
                            !box.delivered &&
                            user.PVZ.includes(box.dispatchPVZ)
                        )"
                      >
                        ID: {{ box.id }}, {{ box.dispatchPVZ }},
                        {{ box.idRows.length }} шт.
                      </option>
                    </select>
                  </div>

                  <div v-if="box.id">
                    <UButton
                      @click="clearBox"
                      icon="i-akar-icons-cross"
                    ></UButton>
                  </div>
                </div>

                <div
                  class="flex max-sm:w-full items-center max-sm:items-end gap-5 mt-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Выберите ПВЗ:</h1>

                    <select
                      @change="changeValue"
                      v-model="selectedPVZ"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option :value="pvz" v-for="pvz in pvzs">
                        {{ pvz.name }}
                      </option>
                    </select>
                  </div>

                  <div v-if="box.id">
                    <UButton
                      v-if="selectedPVZ.name && !isShowQR"
                      @click="isShowQR = true"
                      icon="i-tabler-qrcode"
                    ></UButton>

                    <UButton
                      v-if="selectedPVZ.name && isShowQR"
                      @click="isShowQR = false"
                      icon="i-tabler-qrcode-off"
                    ></UButton>
                  </div>
                </div>

                <div class="mt-5" v-if="!box.id">
                  <UButton
                    class="font-semibold text-lg"
                    @click="createBox('standard')"
                    :disabled="!selectedPVZ.name"
                    icon="i-lucide-package-plus"
                    >Создать коробку
                  </UButton>
                </div>

                <div v-if="selectedPVZ.name && isShowQR && box.id">
                  <div class="flex items-center gap-5 mt-5">
                    <h1 class="text-2xl">Распечатка Штрих-кода</h1>
                    <UIMainButton @click="printPage"
                      >РАСПЕЧАТАТЬ ЭТИКЕТКУ</UIMainButton
                    >
                  </div>
                  <div class="flex flex-col print-content">
                    <div class="gap-0 flex flex-col mr-10">
                      <CodeQR :value="value" class="mt-10" />
                      <h1 class="text-4xl">
                        {{ box.id }}, {{ selectedPVZ.name }}
                      </h1>
                      <h1
                        class="text-6xl mt-2 text-center max-w-[500px] relative"
                      >
                        {{ selectedPVZ.address }}
                      </h1>
                    </div>
                  </div>
                </div>

                <div class="mt-5 px-3 w-full" v-if="isShowBoxItems && box.id">
                  <div class="flex items-center gap-5">
                    <UIMainButton @click="focusInput"
                      >СКАНИРОВАТЬ товары</UIMainButton
                    >
                    <Icon
                      v-if="isScanActive"
                      name="eos-icons:bubble-loading"
                      class="text-secondary-color"
                    />
                  </div>
                  <input
                    class="opacity-0"
                    ref="myInput"
                    autofocus
                    v-model="scanStringItem"
                    @input="scanItem"
                  />

                  <div class="flex items-start justify-start">
                    <div
                      class="flex items-center gap-3 max-sm:flex-col max-sm:items-start"
                    >
                      <div
                        class="flex items-center justify-center gap-3 bg-gray-200 rounded-md py-1 px-3"
                      >
                        <Icon name="i-tabler-package" size="24" />
                        <h1>
                          Коробка – {{ box.id }}, {{ box.idRows.length }} шт.
                        </h1>
                      </div>
                      <div>
                        <UButton
                          class="font-semibold text-sm"
                          @click="closeBox"
                          :disabled="!box.id"
                          icon="i-octicon-package-dependencies-16"
                          >Закрыть коробку
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <DistributionTable
                    @delete-row="deleteRow"
                    @delete-selected-rows="deleteSelectedRows"
                    :user="user"
                    :idRows="box.idRows"
                    :selectedPVZ="selectedPVZ"
                  />
                </div>
              </div>
              <div v-else>
                <UISpinnerModal />
              </div>
            </template>

            <template #kgb="{ item }">
              <div
                v-if="!isLoadingTab"
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <div
                  class="flex max-sm:w-full items-start w-full max-sm:items-end gap-5 mt-3 mb-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Выберите коробку c КГТ:</h1>

                    <select
                      @change="changeBox"
                      v-model="box"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option
                        :value="box"
                        v-for="box in boxes.filter(
                          (box) =>
                            box.type === 'KGT' &&
                            !box.delivered &&
                            user.PVZ.includes(box.dispatchPVZ)
                        )"
                      >
                        ID: {{ box.id }}, {{ box.dispatchPVZ }},
                        {{ box.idRows.length }} КГТ
                      </option>
                    </select>
                  </div>

                  <div v-if="box.id">
                    <UButton
                      @click="clearBox"
                      icon="i-akar-icons-cross"
                    ></UButton>
                  </div>
                </div>

                <div
                  class="flex max-sm:w-full items-center max-sm:items-end gap-5 mt-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base mr-2">Выберите ПВЗ:</h1>

                    <select
                      @change="changeValue"
                      v-model="selectedPVZ"
                      class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9 w-[300px] max-sm:w-full"
                    >
                      <option :value="pvz" v-for="pvz in pvzs">
                        {{ pvz.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div
                  class="flex max-sm:w-full items-center max-sm:items-end gap-5 mt-5 px-5"
                >
                  <div
                    class="flex max-sm:w-full items-center max-sm:flex-col max-sm:items-start gap-3 max-sm:gap-1"
                  >
                    <h1 class="text-base">Количество КГТ:</h1>
                    <UInput
                      class="w-[300px] max-sm:w-full"
                      type="number"
                      v-model="quantityOfKGT"
                    />
                  </div>
                </div>

                <div v-if="box.id" class="mt-3">
                  <UButton
                    v-if="selectedPVZ.name && !isShowQR"
                    @click="isShowQR = true"
                    icon="i-tabler-qrcode"
                  ></UButton>

                  <UButton
                    v-if="selectedPVZ.name && isShowQR"
                    @click="isShowQR = false"
                    icon="i-tabler-qrcode-off"
                  ></UButton>
                </div>

                <div class="mt-5" v-if="!box.id && quantityOfKGT >= 1">
                  <UButton
                    class="font-semibold text-lg"
                    @click="createBox('KGT')"
                    :disabled="!selectedPVZ.name"
                    icon="i-lucide-package-plus"
                    >Создать коробку
                  </UButton>
                </div>

                <div v-if="selectedPVZ.name && isShowQR && box.id">
                  <div class="flex items-center gap-5 mt-5">
                    <h1 class="text-2xl">Распечатка Штрих-кода</h1>
                    <UIMainButton @click="printPage"
                      >РАСПЕЧАТАТЬ ЭТИКЕТКУ</UIMainButton
                    >
                  </div>
                  <div class="flex flex-col print-content">
                    <div class="gap-0 flex flex-col mr-10">
                      <CodeQR2 :value="value" class="mt-10" />
                      <h1 class="text-4xl">
                        {{ box.id }}, {{ selectedPVZ.name }}
                      </h1>
                      <h1
                        class="text-8xl mt-2 text-center max-w-[1000px] relative"
                      >
                        {{ selectedPVZ.address }}
                      </h1>
                    </div>
                  </div>
                </div>

                <div class="mt-5 px-3 w-full" v-if="isShowBoxItems && box.id">
                  <div class="flex items-center gap-5">
                    <UIMainButton @click="focusInput"
                      >СКАНИРОВАТЬ товары</UIMainButton
                    >
                    <Icon
                      v-if="isScanActive"
                      name="eos-icons:bubble-loading"
                      class="text-secondary-color"
                    />
                  </div>
                  <input
                    class="opacity-0"
                    ref="myInput"
                    autofocus
                    v-model="scanStringItem"
                    @input="scanItem"
                  />

                  <div class="flex items-start justify-start">
                    <div
                      class="flex items-center gap-3 max-sm:flex-col max-sm:items-start"
                    >
                      <div
                        class="flex items-center justify-center gap-3 bg-gray-200 rounded-md py-1 px-3"
                      >
                        <Icon name="i-tabler-package" size="24" />
                        <h1>
                          Коробка – {{ box.id }}, {{ box.idRows.length }} шт.
                        </h1>
                      </div>
                      <div>
                        <UButton
                          class="font-semibold text-sm"
                          @click="closeBox"
                          :disabled="!box.id"
                          icon="i-octicon-package-dependencies-16"
                          >Закрыть коробку
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <DistributionTable
                    @delete-row="deleteRow"
                    @delete-selected-rows="deleteSelectedRows"
                    :user="user"
                    :idRows="box.idRows"
                    :selectedPVZ="selectedPVZ"
                  />
                </div>
              </div>
              <div v-else>
                <UISpinnerModal />
              </div>
            </template>

            <template #waiting="{ item }">
              <div
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <DistributionBoxesTable
                  v-if="
                    user.username === 'Шведова' || user.username === 'Мешков'
                  "
                  class="w-full px-5"
                  @delete-row="deleteRow"
                  :user="user"
                  :boxes="
                    boxes.filter((box) => user.PVZ.includes(box.dispatchPVZ))
                  "
                />

                <DistributionBoxesTable
                  v-else-if="
                    user.username === 'Горцуева' ||
                    user.username === 'Власенкова' ||
                    user.username === 'Директор'
                  "
                  class="w-full px-5"
                  @delete-row="deleteRow"
                  :user="user"
                  :boxes="boxes"
                />

                <DistributionBoxesTable
                  v-else
                  class="w-full px-5"
                  @delete-row="deleteRow"
                  :user="user"
                  :boxes="
                    boxes.filter((box) => box.createdUser === user.username)
                  "
                />
              </div>
            </template>
          </UTabs>

          <UTabs
            v-if="user.role === 'COURIER'"
            @change="clearBox"
            :items="itemsCourier"
            class="w-full"
          >
            <template #icon="{ item, selected }">
              <UIcon
                :name="item.icon"
                class="w-4 h-4 flex-shrink-0 me-2"
                :class="[selected && 'text-primary-500 dark:text-primary-400']"
              />
            </template>

            <template #default="{ item, selected }">
              <span
                class="truncate"
                :class="[selected && 'text-secondary-color']"
                >{{ item.label }}</span
              >
            </template>

            <template #scan="{ item }">
              <div
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <div class="flex items-center gap-5 my-10">
                  <div class="max-sm:flex max-sm:flex-col gap-3">
                    <UIMainButton @click="focusInputCourier"
                      >СКАНИРОВАТЬ
                    </UIMainButton>
                    <UIMainButton @click="clearScannedBoxes"
                      >очистить список
                    </UIMainButton>
                  </div>

                  <Icon
                    v-if="isScanActive"
                    name="eos-icons:bubble-loading"
                    class="text-secondary-color"
                  />
                </div>
                <input
                  class="opacity-0"
                  ref="myInputCourier"
                  autofocus
                  v-model="scanStringItemCourier"
                  @input="scanItemCourier"
                />

                <DistributionBoxesTable
                  v-if="boxesScanned.length"
                  :user="user"
                  :boxes="boxesScanned"
                  class="w-full px-2"
                />
              </div>
            </template>

            <template #delivery="{ item }">
              <div
                class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
              >
                <div class="w-full flex flex-col gap-7 px-3">
                  <div
                    @click="showBoxes(pvz)"
                    class="bg-gray-50 border-[1px] text-lg duration-200 rounded-md shadow-inner py-3 px-5 cursor-pointer max-sm:text-base"
                    v-for="pvz in pvzsBoxesScanned"
                  >
                    <div class="flex items-center gap-3">
                      <Icon
                        class="text-secondary-color"
                        name="i-hugeicons-truck-delivery"
                        size="24"
                      />
                      <h1>
                        {{ pvz }}, {{ getNameFromPVZ(pvz) }}. Количество коробок
                        {{
                          boxes.filter(
                            (box) =>
                              box.dispatchPVZ === pvz &&
                              box.sorted &&
                              !box.delivered &&
                              box.type === "standard"
                          ).length
                        }}/{{
                          boxes.filter(
                            (box) =>
                              box.dispatchPVZ === pvz &&
                              box.sorted &&
                              !box.delivered &&
                              box.type === "standard"
                          ).length +
                          boxes.filter(
                            (box) =>
                              box.dispatchPVZ === pvz &&
                              box.delivered &&
                              box.type === "standard"
                          ).length
                        }}
                        + КГТ
                        {{
                          boxes.filter(
                            (box) =>
                              box.dispatchPVZ === pvz &&
                              box.sorted &&
                              !box.delivered &&
                              box.type === "KGT"
                          ).length
                        }}/{{
                          boxes.filter(
                            (box) =>
                              box.dispatchPVZ === pvz &&
                              box.delivered &&
                              box.type === "KGT"
                          ).length
                        }}
                      </h1>
                    </div>

                    <div v-if="nameForShow === pvz">
                      <div
                        class="border-[1px] mt-3 mb-3 py-3 px-5 rounded-md shadow-lg"
                      >
                        <div class="flex items-center justify-start gap-2">
                          <Icon
                            name="i-material-symbols-light-package-2-outline"
                            size="24"
                          />
                          <h1>Обычные коробки</h1>
                        </div>
                        <DistributionBoxesTableId
                          :user="user"
                          :boxes="
                            boxes.filter(
                              (box) =>
                                box.dispatchPVZ === pvz &&
                                (box.sorted || box.delivered) &&
                                box.type === 'standard'
                            )
                          "
                          class="w-full px-2"
                        />
                      </div>

                      <div
                        class="border-[1px] mt-3 mb-3 py-3 px-5 rounded-md shadow-lg"
                      >
                        <div class="flex items-center justify-start gap-2">
                          <Icon
                            name="i-streamline-shipping-transfer-cart-package-box-fulfillment-cart-warehouse-shipping-delivery"
                            size="24"
                          />
                          <h1>КГТ</h1>
                        </div>
                        <DistributionBoxesTableId
                          :user="user"
                          :boxes="
                            boxes.filter(
                              (box) =>
                                box.dispatchPVZ === pvz &&
                                (box.sorted || box.delivered) &&
                                box.type === 'KGT'
                            )
                          "
                          class="w-full px-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </UTabs>
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

<style>
/* Стили для печати */
@media print {
  body * {
    visibility: hidden;
  }

  .print-content,
  .print-content * {
    visibility: visible;
  }

  .print-content {
    position: absolute;
    left: 15%;
    top: 10%;
  }
}
</style>
