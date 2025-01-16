<script setup lang="ts">
import { useToast } from "vue-toastification";
import Cookies from "js-cookie";

import ru from "date-fns/locale/ru";
import { format } from "date-fns";

let toast = useToast();

const route = useRoute();
let fromNameString = route.params.fromName;
let cellString = route.params.cell;
let pvzLink = route.params.pvz;

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

let rowData = ref({} as IOurRansom);

let isOpen = ref(false);

function openModal(row: IOurRansom) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.deliveredSC = rowData.value.deliveredSC
      ? storeUsers.getISODateTime(rowData.value.deliveredSC)
      : null;
    rowData.value.deliveredPVZ = rowData.value.deliveredPVZ
      ? storeUsers.getISODateTime(rowData.value.deliveredPVZ)
      : null;
    rowData.value.issued = rowData.value.issued
      ? storeUsers.getISODateTime(rowData.value.issued)
      : null;
  } else {
    rowData.value = {} as IOurRansom;
    rowData.value.fromName = "";
  }
  isShowModalValue.value = true;
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IOurRansom;
  isShowModalValue.value = false;
}

async function updateDeliveryRow(obj: any) {
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer)
    await storeRansom.updateDeliveryStatus(
      obj.row,
      obj.flag,
      "OurRansom",
      user.value.username
    );
  filteredRows.value = await storeRansom.getRansomRowsByFromName(
    fromNameString,
    cellString,
    "OurRansom"
  );
}

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить данную строку?");
  if (answer) await storeRansom.deleteRansomRow(id, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByFromName(
    fromNameString,
    cellString,
    "OurRansom"
  );
}

async function deleteSelectedRows(idArray: number[]) {
  let answer = confirm(
    `Вы точно хотите удалить данные строки? Количество записей: ${idArray.length}`
  );
  if (answer) await storeRansom.deleteRansomSelectedRows(idArray, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByFromName(
    fromNameString,
    cellString,
    "OurRansom"
  );
}

async function updateRow() {
  isLoading.value = true;

  await storeRansom.updateRansomRow(
    rowData.value,
    user.value.username,
    "OurRansom"
  );
  filteredRows.value = await storeRansom.getRansomRowsByFromName(
    fromNameString,
    cellString,
    "OurRansom"
  );
  closeModal();

  isLoading.value = false;
}

async function createRow() {
  isLoading.value = true;

  await storeRansom.createRansomRow(
    rowData.value,
    user.value.username,
    "OurRansom"
  );
  filteredRows.value = await storeRansom.getRansomRowsByFromName(
    fromNameString,
    cellString,
    "OurRansom"
  );
  closeModal();

  isLoading.value = false;
}

async function createCopyRow(id: number) {
  await storeRansom.createCopyRow(id, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByFromName(
    fromNameString,
    cellString,
    "OurRansom"
  );
}

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
    }
  }
}

let originallyRows = ref<Array<IOurRansom>>();

onMounted(async () => {
  if (!token || user.value.dataOurRansom === "NONE") {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();

  if (user.value.role !== "PVZ") {
    rows.value = await storeRansom.getRansomRowsByFromName(
      fromNameString,
      cellString,
      "OurRansom"
    );
    filteredRows.value = rows.value;
  } else {
    rows.value = await storeRansom.getRansomRowsByFromName(
      fromNameString,
      cellString,
      "OurRansom"
    );
    rows.value = rows.value?.filter(
      (row) => row.deliveredSC !== null && row.issued === null
    );
    filteredRows.value = rows.value;
  }

  if (rows.value) {
    handleFilteredRows(rows.value);
  }

  if (!user.value.PVZ.includes(pvzLink)) {
    toast.error("У вас нет прав на просмотр товаров этого ПВЗ!");
    router.push("/spreadsheets/our-ransom");
  }

  isLoading.value = false;

  let originallyRowsDataOne =
    await storeRansom.getRansomRowsForModalOurRansomPartOne();
  let originallyRowsDataTwo =
    await storeRansom.getRansomRowsForModalOurRansomPartTwo();
  let originallyRowsDataThree =
    await storeRansom.getRansomRowsForModalOurRansomPartThree();
  originallyRows.value = [
    ...originallyRowsDataOne,
    ...originallyRowsDataTwo,
    ...originallyRowsDataThree,
  ];
  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  orderAccounts.value = await storeOrderAccounts.getOrderAccounts();
});

definePageMeta({
  layout: false,
  name: "Товары по телефону",
});

const token = Cookies.get("token");
let showAddFields = ref(false);

let isAutoCell = ref(true);
let isAutoFromName = ref(true);
let isAutoPVZ = ref(true);

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCellFromName() {
  if (rowData.value.fromName.trim().length === 4) {
    let phoneNum = rowData.value.fromName.trim().toString().slice(-4);
    let row = originallyRows.value?.filter((row) =>
      row.fromName ? row.fromName.slice(-4) === phoneNum : ""
    );

    if (row && row.length > 0) {
      if (row.some((r) => r.fromName !== row[0].fromName)) {
        toast.warning("Было найдено несколько номеров. Впишите полный номер");
      } else {
        rowData.value.fromName = row[0].fromName;
      }
    }
  }

  if (rowData.value.fromName.trim().length === 12 && isAutoPVZ.value === true) {
    let row = originallyRows.value?.filter(
      (row) => row.fromName === rowData.value.fromName
    );
    if (row && row.length > 0) {
      if (row.some((r) => r.dispatchPVZ !== row[0].dispatchPVZ)) {
        toast.warning(
          "У клиента есть товары на разных ПВЗ! Выберите ПВЗ самостоятельно"
        );
      } else {
        rowData.value.dispatchPVZ = row[0].dispatchPVZ;
      }
    }
  }

  if (
    rowData.value.fromName.trim().length === 12 &&
    isAutoFromName.value === true
  ) {
    let row = originallyRows.value?.filter(
      (row) =>
        row.fromName === rowData.value.fromName &&
        row.dispatchPVZ === rowData.value.dispatchPVZ &&
        (row.deliveredPVZ === null || row.deliveredSC === null)
    );
    if (row && row.length > 0) {
      rowData.value.cell = row[0].cell;
    }
  }
}

async function changePVZ() {
  if (
    rowData.value.fromName.trim().length === 12 &&
    isAutoFromName.value === true
  ) {
    let row = originallyRows.value?.filter(
      (row) =>
        row.fromName === rowData.value.fromName &&
        row.dispatchPVZ === rowData.value.dispatchPVZ &&
        (row.deliveredPVZ === null || row.deliveredSC === null)
    );
    if (row && row.length > 0) {
      rowData.value.cell = row[0].cell;
    } else {
      const unoccupiedCellsAndPVZ = await getUnoccupiedCellsAndPVZ();
      const freeCell = unoccupiedCellsAndPVZ.find(
        (cell) => cell.dispatchPVZ === rowData.value.dispatchPVZ
      );
      if (freeCell) {
        rowData.value.cell = freeCell.cell;
      } else {
        toast.warning("Нет свободных ячеек для выбранного ПВЗ");
      }
    }
  }
}

async function getUnoccupiedCellsAndPVZ() {
  const unoccupiedCells = new Map();

  originallyRows.value?.forEach((row) => {
    const { cell, issued, dispatchPVZ } = row;
    if (!unoccupiedCells.has(cell)) {
      unoccupiedCells.set(cell, {
        dispatchPVZ,
        hasEmptyIssued: issued === null,
      });
    } else {
      const currentInfo = unoccupiedCells.get(cell);
      currentInfo.hasEmptyIssued =
        currentInfo.hasEmptyIssued || issued === null;
      unoccupiedCells.set(cell, currentInfo);
    }
  });

  const result: any[] = [];
  unoccupiedCells.forEach((value, key) => {
    if (!value.hasEmptyIssued) {
      result.push({ cell: key, dispatchPVZ: value.dispatchPVZ });
    }
  });

  return result;
}

async function getFromNameFromCell() {
  await sleep(3000);
  if (rowData.value.cell.trim() && isAutoCell.value === true) {
    let rowFromName = originallyRows.value?.filter(
      (row) => row.cell === rowData.value.cell
    );
    if (rowFromName) {
      rowData.value.fromName = rowFromName[0].fromName;
    }
  }
}

async function showDeletedRows(flag: boolean) {
  if (flag) {
    let deletedRows = await storeRansom.getRansomRowsWithDeleted("OurRansom");
    filteredRows.value = deletedRows;
    rows.value = filteredRows.value;
  } else {
    isLoading.value = true;
    filteredRows.value = await storeRansom.getRansomRowsByFromName(
      fromNameString,
      cellString,
      "OurRansom"
    );
    rows.value = filteredRows.value;
    isLoading.value = false;
  }
}

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
      filteredRows.value = await storeRansom.getRansomRowsByFromName(
        fromNameString,
        cellString,
        "OurRansom"
      );
      rows.value = filteredRows.value;
      router.push(`/spreadsheets/our-ransom/${pvzLink}`);
      isLoading.value = false;
    }
  } else {
    isLoading.value = true;
    await storeRansom.updateDeliveryRowsStatus(
      obj.idArray,
      obj.flag,
      "OurRansom",
      user.value.username
    );
    filteredRows.value = await storeRansom.getRansomRowsByFromName(
      fromNameString,
      cellString,
      "OurRansom"
    );
    rows.value = filteredRows.value;
    router.push(`/spreadsheets/our-ransom/${pvzLink}`);
    isLoading.value = false;
  }
}

async function updateOnlineMoneyRowsStatus() {
  isOpenOnlineStatus.value = false;
  isLoading.value = true;
  await storeRansom.updateDeliveryRowsStatus(
    itemsId.value,
    "additionally",
    "OurRansom",
    user.value.username
  );
  filteredRows.value = await storeRansom.getRansomRowsByFromName(
    fromNameString,
    cellString,
    "OurRansom"
  );
  rows.value = filteredRows.value;
  isLoading.value = false;
  updatedPriceTwoPercent.value = 0;
  itemsId.value = [];
}

let updatedPriceTwoPercent = ref(0);
let itemsId = ref<Array<number[]>>();
let isOpenOnlineStatus = ref(false);

let isShowModalValue = ref(false);

async function clearRow(id: number) {
  let answer = confirm("Вы точно хотите очистить данную строку?");
  if (answer) {
    isLoading.value = true;
    await storeRansom.clearRansomRow(id, "OurRansom");
    filteredRows.value = await storeRansom.getRansomRowsOurRansom();
    rows.value = filteredRows.value;
    isLoading.value = false;
  }
}

async function checkPercent() {
  if (rowData.value.dispatchPVZ) {
    if (pvzPercent.value) {
      let percentPVZ = pvzPercent.value.find(
        (row: any) =>
          row.pvz.name === rowData.value.dispatchPVZ && row.flag === "OurRansom"
      ) as any;
      if (rowData.value.productLink) {
        if (rowData.value.productLink.includes("wildberries")) {
          rowData.value.percentClient = percentPVZ.wb;
        } else if (rowData.value.productLink.includes("ozon")) {
          rowData.value.percentClient = percentPVZ.ozon;
        } else if (rowData.value.productLink.includes("yandex")) {
          rowData.value.percentClient = percentPVZ.ym;
        }
      }
    }
  }
}

let additionallies = [
  { name: "Отменить", value: "" },
  { name: "Оплата наличными", value: "Оплата наличными" },
  { name: "Оплачено онлайн", value: "Оплачено онлайн" },
  { name: "Отказ клиент", value: "Отказ клиент" },
  { name: "Отказ брак", value: "Отказ брак" },
  { name: "Отказ подмена", value: "Отказ подмена" },
];

function onDateInput(event: any) {
  if (event.target.value === "") {
    console.log("Дата удалена!");
    rowData.value.additionally = "";
  }
}
</script>

<template>
  <Head>
    <Title>Товары клиентов</Title>
  </Head>
  <div>
    <div
      v-if="isOpenOnlineStatus"
      class="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-75 z-[100]"
    >
      <div class="flex items-center justify-center h-screen">
        <div class="bg-white w-[500px] p-10 rounded-xl text-center">
          <h1 class="text-lg">При оплате онлайн сумма увеличится на 2%!</h1>
          <h1 class="text-2xl font-bold">
            ИТОГОВАЯ СУММА:
            {{ Math.ceil(updatedPriceTwoPercent / 10) * 10 }} руб
          </h1>
          <div class="flex gap-5 mt-5 items-center justify-center">
            <UIActionButton @click="isOpenOnlineStatus = false"
              >Отменить</UIActionButton
            >
            <UIExitModalButton @click="updateOnlineMoneyRowsStatus"
              >Принять</UIExitModalButton
            >
          </div>
        </div>
      </div>
    </div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div v-if="!isLoading" class="px-5 pt-5 max-sm:px-5 pb-5 w-screen">
          <div>
            <SpreadsheetsOurRansomFilters
              v-if="rows"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
              :user="user"
            />
            <div
              class="mt-5 flex items-center gap-3"
              v-if="user.dataOurRansom === 'WRITE'"
            >
              <UIMainButton
                v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
                @click="openModal"
              >
                Создать новую запись</UIMainButton
              >
            </div>
          </div>

          <SpreadsheetsOurRansomTable1
            @update-delivery-row="updateDeliveryRow"
            :rows="filteredRows"
            :user="user"
            @delete-row="deleteRow"
            @clear-row="clearRow"
            @open-modal="openModal"
            @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows"
            @create-copy-row="createCopyRow"
            @show-deleted-rows="showDeletedRows"
            :isShowModalValue="isShowModalValue"
            :pvz-link="pvzLink"
          />

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon size="24" name="material-symbols:task-alt" />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div
                  v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="fromName" class="max-sm:text-sm"
                    >Телефон <sup>*</sup></label
                  >
                  <div class="w-full">
                    <input
                      :disabled="user.fromName1 === 'READ'"
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                      v-model="rowData.fromName"
                      type="text"
                      @input="getCellFromName"
                    />
                    <div class="flex gap-3 items-center justify-center mt-1">
                      <h1 class="max-sm:text-sm">АВТО</h1>
                      <input
                        class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
                        type="checkbox"
                        v-model="isAutoFromName"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-start w-full text-left gap-2">
                  <div
                    v-if="
                      user.dispatchPVZ1 === 'READ' ||
                      user.dispatchPVZ1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 w-full"
                  >
                    <label for="dispatchPVZ1">Отправка в ПВЗ</label>

                    <USelect
                      v-if="!user.username.includes('Светлана')"
                      @change="changePVZ(), checkPercent()"
                      class="w-full"
                      v-model="rowData.dispatchPVZ"
                      :options="pvz"
                      option-attribute="name"
                      value-attribute="name"
                    />

                    <USelect
                      v-if="user.username.includes('Светлана')"
                      @change="changePVZ(), checkPercent()"
                      class="w-full"
                      v-model="rowData.dispatchPVZ"
                      :options="
                        pvz?.filter(
                          (pvz) =>
                            pvz.name !== 'ППВЗ_7' && pvz.name !== 'ППВЗ_9'
                        )
                      "
                      option-attribute="name"
                      value-attribute="name"
                    />

                    <div
                      class="flex gap-3 items-center justify-center mt-1 w-full"
                    >
                      <h1 class="max-sm:text-sm">АВТО</h1>
                      <input
                        class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
                        type="checkbox"
                        v-model="isAutoPVZ"
                      />
                    </div>
                  </div>
                </div>

                <div
                  v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="cell">Ячейка</label>
                  <input
                    class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    :disabled="user.cell1 === 'READ'"
                    v-model="rowData.cell"
                    @input="getFromNameFromCell"
                    type="text"
                  />

                  <div
                    class="flex gap-3 items-center justify-center mt-1 w-full"
                  >
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input
                      class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
                      type="checkbox"
                      v-model="isAutoCell"
                    />
                  </div>
                </div>

                <div
                  class="flex flex-col items-start text-left gap-2 mb-5"
                  v-if="
                    user.productLink1 === 'READ' ||
                    user.productLink1 === 'WRITE'
                  "
                >
                  <label for="productLink1">Товар (ссылка)</label>
                  <input
                    :disabled="user.productLink1 === 'READ'"
                    class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    v-model="rowData.productLink"
                    type="text"
                  />
                </div>

                <div
                  class="flex flex-col items-start text-left gap-2 mb-5"
                  v-if="
                    user.productName1 === 'READ' ||
                    user.productName1 === 'WRITE'
                  "
                >
                  <label for="productName1">Название товара</label>
                  <UInput
                    :disabled="user.productName1 === 'READ'"
                    class="w-full"
                    v-model="rowData.productName"
                    type="text"
                  />
                </div>

                <div
                  v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="notation1">Примечание</label>
                  <UInput
                    :disabled="user.notation1 === 'READ'"
                    class="w-full"
                    v-model="rowData.notation"
                    placeholder="По умолчанию: Пусто"
                    type="text"
                  />
                </div>

                <div
                  v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="priceSite">Стоимость сайт</label>
                  <UInput
                    :disabled="user.priceSite === 'READ'"
                    class="w-full"
                    v-model="rowData.priceSite"
                    type="number"
                  />
                </div>

                <div
                  v-if="
                    user.deliveredKGT1 === 'READ' ||
                    user.deliveredKGT1 === 'WRITE'
                  "
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="deliveredKGT1">Дополнительный доход</label>
                  <UInput
                    :disabled="user.deliveredKGT1 === 'READ'"
                    class="w-full"
                    placeholder="По умолчанию: 0"
                    v-model="rowData.deliveredKGT"
                    type="number"
                  />
                </div>

                <div
                  v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="orderPVZ1">Заказано на СЦ</label>
                  <USelect
                    class="w-full"
                    v-model="rowData.orderPVZ"
                    :options="sortingCenters"
                    option-attribute="name"
                    value-attribute="name"
                  />
                </div>

                <div
                  v-if="
                    user.orderAccount === 'READ' ||
                    user.orderAccount === 'WRITE'
                  "
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="orderAccount">Аккаунт заказа</label>
                  <USelect
                    class="w-full"
                    v-model="rowData.orderAccount"
                    :options="orderAccounts"
                    option-attribute="name"
                    value-attribute="name"
                  />
                </div>

                <h1
                  @click="showAddFields = !showAddFields"
                  class="cursor-pointer hover:opacity-50 text-secondary-color font-bold duration-200 mb-5"
                >
                  Показать ещё настройки
                </h1>

                <div v-if="showAddFields">
                  <div
                    v-if="
                      user.prepayment1 === 'READ' ||
                      user.prepayment1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="deliveredKGT1">Предоплата</label>
                    <UInput
                      :disabled="user.prepayment1 === 'READ'"
                      class="w-full"
                      placeholder="По умолчанию: 0"
                      v-model="rowData.prepayment"
                      type="number"
                    />
                  </div>

                  <div
                    v-if="
                      user.percentClient1 === 'READ' ||
                      user.percentClient1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="percentClient1">Процент с клиента</label>
                    <UInput
                      :disabled="user.percentClient1 === 'READ'"
                      class="w-full"
                      placeholder="По умолчанию: 10"
                      v-model="rowData.percentClient"
                      type="number"
                    />
                  </div>

                  <div
                    v-if="
                      user.deliveredSC1 === 'READ' ||
                      user.deliveredSC1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="deliveredSC1">Доставлено на СЦ</label>
                    <UPopover
                      class="w-full"
                      v-if="rowData.deliveredSC"
                      :popper="{ placement: 'bottom-start' }"
                    >
                      <UButton
                        :overlay="true"
                        type="button"
                        icon="i-heroicons-calendar-days-20-solid"
                        color="white"
                        class="w-full"
                      >
                        {{
                          format(rowData.deliveredSC, "dd MMM yyy", {
                            locale: ru,
                          })
                        }}
                      </UButton>

                      <template #panel="{ close }">
                        <DatePickerNotRange
                          v-model="rowData.deliveredSC"
                          is-required
                          @close="close"
                        />
                      </template>
                    </UPopover>
                    <div v-if="rowData.deliveredSC">
                      <UButton @click="rowData.deliveredSC = ''"
                        >Очистить дату</UButton
                      >
                    </div>
                    <div
                      class="text-center rounded-md w-full"
                      v-if="!rowData.deliveredSC"
                    >
                      <input
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        :disabled="user.deliveredSC1 === 'READ'"
                        v-model="rowData.deliveredSC"
                        type="date"
                      />
                    </div>
                  </div>

                  <div
                    v-if="
                      user.deliveredPVZ1 === 'READ' ||
                      user.deliveredPVZ1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="deliveredPVZ1">Доставлено на ПВЗ</label>
                    <UPopover
                      class="w-full"
                      v-if="rowData.deliveredPVZ"
                      :popper="{ placement: 'bottom-start' }"
                    >
                      <UButton
                        :overlay="true"
                        type="button"
                        icon="i-heroicons-calendar-days-20-solid"
                        color="white"
                        class="w-full"
                      >
                        {{
                          format(rowData.deliveredPVZ, "dd MMM yyy", {
                            locale: ru,
                          })
                        }}
                      </UButton>

                      <template #panel="{ close }">
                        <DatePickerNotRange
                          v-model="rowData.deliveredPVZ"
                          is-required
                          @close="close"
                        />
                      </template>
                    </UPopover>
                    <div v-if="rowData.deliveredPVZ">
                      <UButton @click="rowData.deliveredPVZ = ''"
                        >Очистить дату</UButton
                      >
                    </div>
                    <div
                      class="text-center rounded-md w-full"
                      v-if="!rowData.deliveredPVZ"
                    >
                      <input
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        :disabled="user.deliveredPVZ1 === 'READ'"
                        v-model="rowData.deliveredPVZ"
                        type="date"
                      />
                    </div>
                  </div>

                  <div
                    v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="issued1">Выдано</label>
                    <UPopover
                      class="w-full"
                      v-if="rowData.issued"
                      :popper="{ placement: 'bottom-start' }"
                    >
                      <UButton
                        :overlay="true"
                        type="button"
                        icon="i-heroicons-calendar-days-20-solid"
                        color="white"
                        class="w-full"
                      >
                        {{
                          format(rowData.issued, "dd MMM yyy", { locale: ru })
                        }}
                      </UButton>

                      <template #panel="{ close }">
                        <DatePickerNotRange
                          v-model="rowData.issued"
                          is-required
                          @close="close"
                          @input="onDateInput"
                        />
                      </template>
                    </UPopover>
                    <div v-if="rowData.issued">
                      <UButton
                        @click="
                          (rowData.issued = ''), (rowData.additionally = '')
                        "
                        >Очистить дату</UButton
                      >
                    </div>
                    <div
                      class="text-center rounded-md w-full"
                      v-if="!rowData.issued"
                    >
                      <input
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        :disabled="user.issued1 === 'READ'"
                        v-model="rowData.issued"
                        type="date"
                      />
                    </div>
                  </div>

                  <div
                    v-if="
                      user.additionally3 === 'READ' ||
                      user.additionally3 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="additionally1">Дополнительно</label>
                    <USelect
                      class="w-full"
                      v-model="rowData.additionally"
                      :options="additionallies"
                      option-attribute="name"
                    />
                  </div>
                </div>

                <div class="flex flex-col items-center gap-2 mr-5">
                  <label>Предоплата</label>
                  <input
                    class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                    type="checkbox"
                    required
                    v-model="rowData.dp"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton
                  :disabled="
                    rowData.fromName === '' || rowData.fromName === null
                  "
                  @click="createRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="table-user-no-pad">
        <div v-if="!isLoading" class="px-5 pt-5 max-sm:px-5 pb-5 w-screen">
          <div>
            <SpreadsheetsOurRansomFilters
              v-if="rows && user.role !== 'PVZ' && user.role !== 'PPVZ'"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
              :user="user"
            />
            <div
              class="mt-5 flex items-center gap-3"
              v-if="user.dataOurRansom === 'WRITE'"
            >
              <UIMainButton
                v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
                @click="openModal"
              >
                Создать новую запись</UIMainButton
              >
            </div>
          </div>

          <SpreadsheetsOurRansomTable1
            @update-delivery-row="updateDeliveryRow"
            :rows="filteredRows"
            :user="user"
            @delete-row="deleteRow"
            @clear-row="clearRow"
            @open-modal="openModal"
            @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows"
            @create-copy-row="createCopyRow"
            @show-deleted-rows="showDeletedRows"
            :isShowModalValue="isShowModalValue"
            :pvz-link="pvzLink"
          />

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon size="24" name="material-symbols:task-alt" />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div
                  v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="fromName" class="max-sm:text-sm"
                    >Телефон <sup>*</sup></label
                  >
                  <div class="w-full">
                    <input
                      :disabled="user.fromName1 === 'READ'"
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                      v-model="rowData.fromName"
                      type="text"
                      @input="getCellFromName"
                    />
                    <div class="flex gap-3 items-center justify-center mt-1">
                      <h1 class="max-sm:text-sm">АВТО</h1>
                      <input
                        class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
                        type="checkbox"
                        v-model="isAutoFromName"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-start w-full text-left gap-2">
                  <div
                    v-if="
                      user.dispatchPVZ1 === 'READ' ||
                      user.dispatchPVZ1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 w-full"
                  >
                    <label for="dispatchPVZ1">Отправка в ПВЗ</label>

                    <USelect
                      v-if="!user.username.includes('Светлана')"
                      @change="changePVZ(), checkPercent()"
                      class="w-full"
                      v-model="rowData.dispatchPVZ"
                      :options="pvz"
                      option-attribute="name"
                      value-attribute="name"
                    />

                    <USelect
                      v-if="user.username.includes('Светлана')"
                      @change="changePVZ(), checkPercent()"
                      class="w-full"
                      v-model="rowData.dispatchPVZ"
                      :options="
                        pvz?.filter(
                          (pvz) =>
                            pvz.name !== 'ППВЗ_7' && pvz.name !== 'ППВЗ_9'
                        )
                      "
                      option-attribute="name"
                      value-attribute="name"
                    />

                    <div
                      class="flex gap-3 items-center justify-center mt-1 w-full"
                    >
                      <h1 class="max-sm:text-sm">АВТО</h1>
                      <input
                        class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
                        type="checkbox"
                        v-model="isAutoPVZ"
                      />
                    </div>
                  </div>
                </div>

                <div
                  v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="cell">Ячейка</label>
                  <input
                    class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    :disabled="user.cell1 === 'READ'"
                    v-model="rowData.cell"
                    @input="getFromNameFromCell"
                    type="text"
                  />

                  <div
                    class="flex gap-3 items-center justify-center mt-1 w-full"
                  >
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input
                      class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
                      type="checkbox"
                      v-model="isAutoCell"
                    />
                  </div>
                </div>

                <div
                  class="flex flex-col items-start text-left gap-2 mb-5"
                  v-if="
                    user.productLink1 === 'READ' ||
                    user.productLink1 === 'WRITE'
                  "
                >
                  <label for="productLink1">Товар (ссылка)</label>
                  <input
                    :disabled="user.productLink1 === 'READ'"
                    class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    v-model="rowData.productLink"
                    type="text"
                  />
                </div>

                <div
                  class="flex flex-col items-start text-left gap-2 mb-5"
                  v-if="
                    user.productName1 === 'READ' ||
                    user.productName1 === 'WRITE'
                  "
                >
                  <label for="productName1">Название товара</label>
                  <UInput
                    :disabled="user.productName1 === 'READ'"
                    class="w-full"
                    v-model="rowData.productName"
                    type="text"
                  />
                </div>

                <div
                  v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="notation1">Примечание</label>
                  <UInput
                    :disabled="user.notation1 === 'READ'"
                    class="w-full"
                    v-model="rowData.notation"
                    placeholder="По умолчанию: Пусто"
                    type="text"
                  />
                </div>

                <div
                  v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="priceSite">Стоимость сайт</label>
                  <UInput
                    :disabled="user.priceSite === 'READ'"
                    class="w-full"
                    v-model="rowData.priceSite"
                    type="number"
                  />
                </div>

                <div
                  v-if="
                    user.deliveredKGT1 === 'READ' ||
                    user.deliveredKGT1 === 'WRITE'
                  "
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="deliveredKGT1">Дополнительный доход</label>
                  <UInput
                    :disabled="user.deliveredKGT1 === 'READ'"
                    class="w-full"
                    placeholder="По умолчанию: 0"
                    v-model="rowData.deliveredKGT"
                    type="number"
                  />
                </div>

                <div
                  v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="orderPVZ1">Заказано на СЦ</label>
                  <USelect
                    class="w-full"
                    v-model="rowData.orderPVZ"
                    :options="sortingCenters"
                    option-attribute="name"
                    value-attribute="name"
                  />
                </div>

                <div
                  v-if="
                    user.orderAccount === 'READ' ||
                    user.orderAccount === 'WRITE'
                  "
                  class="flex flex-col items-start text-left gap-2 mb-5"
                >
                  <label for="orderAccount">Аккаунт заказа</label>
                  <USelect
                    class="w-full"
                    v-model="rowData.orderAccount"
                    :options="orderAccounts"
                    option-attribute="name"
                    value-attribute="name"
                  />
                </div>

                <h1
                  @click="showAddFields = !showAddFields"
                  class="cursor-pointer hover:opacity-50 text-secondary-color font-bold duration-200 mb-5"
                >
                  Показать ещё настройки
                </h1>

                <div v-if="showAddFields">
                  <div
                    v-if="
                      user.prepayment1 === 'READ' ||
                      user.prepayment1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="deliveredKGT1">Предоплата</label>
                    <UInput
                      :disabled="user.prepayment1 === 'READ'"
                      class="w-full"
                      placeholder="По умолчанию: 0"
                      v-model="rowData.prepayment"
                      type="number"
                    />
                  </div>

                  <div
                    v-if="
                      user.percentClient1 === 'READ' ||
                      user.percentClient1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="percentClient1">Процент с клиента</label>
                    <UInput
                      :disabled="user.percentClient1 === 'READ'"
                      class="w-full"
                      placeholder="По умолчанию: 10"
                      v-model="rowData.percentClient"
                      type="number"
                    />
                  </div>

                  <div
                    v-if="
                      user.deliveredSC1 === 'READ' ||
                      user.deliveredSC1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="deliveredSC1">Доставлено на СЦ</label>
                    <UPopover
                      class="w-full"
                      v-if="rowData.deliveredSC"
                      :popper="{ placement: 'bottom-start' }"
                    >
                      <UButton
                        :overlay="true"
                        type="button"
                        icon="i-heroicons-calendar-days-20-solid"
                        color="white"
                        class="w-full"
                      >
                        {{
                          format(rowData.deliveredSC, "dd MMM yyy", {
                            locale: ru,
                          })
                        }}
                      </UButton>

                      <template #panel="{ close }">
                        <DatePickerNotRange
                          v-model="rowData.deliveredSC"
                          is-required
                          @close="close"
                        />
                      </template>
                    </UPopover>
                    <div v-if="rowData.deliveredSC">
                      <UButton @click="rowData.deliveredSC = ''"
                        >Очистить дату</UButton
                      >
                    </div>
                    <div
                      class="text-center rounded-md w-full"
                      v-if="!rowData.deliveredSC"
                    >
                      <input
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        :disabled="user.deliveredSC1 === 'READ'"
                        v-model="rowData.deliveredSC"
                        type="date"
                      />
                    </div>
                  </div>

                  <div
                    v-if="
                      user.deliveredPVZ1 === 'READ' ||
                      user.deliveredPVZ1 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="deliveredPVZ1">Доставлено на ПВЗ</label>
                    <UPopover
                      class="w-full"
                      v-if="rowData.deliveredPVZ"
                      :popper="{ placement: 'bottom-start' }"
                    >
                      <UButton
                        :overlay="true"
                        type="button"
                        icon="i-heroicons-calendar-days-20-solid"
                        color="white"
                        class="w-full"
                      >
                        {{
                          format(rowData.deliveredPVZ, "dd MMM yyy", {
                            locale: ru,
                          })
                        }}
                      </UButton>

                      <template #panel="{ close }">
                        <DatePickerNotRange
                          v-model="rowData.deliveredPVZ"
                          is-required
                          @close="close"
                        />
                      </template>
                    </UPopover>
                    <div v-if="rowData.deliveredPVZ">
                      <UButton @click="rowData.deliveredPVZ = ''"
                        >Очистить дату</UButton
                      >
                    </div>
                    <div
                      class="text-center rounded-md w-full"
                      v-if="!rowData.deliveredPVZ"
                    >
                      <input
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        :disabled="user.deliveredPVZ1 === 'READ'"
                        v-model="rowData.deliveredPVZ"
                        type="date"
                      />
                    </div>
                  </div>

                  <div
                    v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="issued1">Выдано</label>
                    <UPopover
                      class="w-full"
                      v-if="rowData.issued"
                      :popper="{ placement: 'bottom-start' }"
                    >
                      <UButton
                        :overlay="true"
                        type="button"
                        icon="i-heroicons-calendar-days-20-solid"
                        color="white"
                        class="w-full"
                      >
                        {{
                          format(rowData.issued, "dd MMM yyy", { locale: ru })
                        }}
                      </UButton>

                      <template #panel="{ close }">
                        <DatePickerNotRange
                          v-model="rowData.issued"
                          is-required
                          @close="close"
                          @input="onDateInput"
                        />
                      </template>
                    </UPopover>
                    <div v-if="rowData.issued">
                      <UButton
                        @click="
                          (rowData.issued = ''), (rowData.additionally = '')
                        "
                        >Очистить дату</UButton
                      >
                    </div>
                    <div
                      class="text-center rounded-md w-full"
                      v-if="!rowData.issued"
                    >
                      <input
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        :disabled="user.issued1 === 'READ'"
                        v-model="rowData.issued"
                        type="date"
                      />
                    </div>
                  </div>

                  <div
                    v-if="
                      user.additionally3 === 'READ' ||
                      user.additionally3 === 'WRITE'
                    "
                    class="flex flex-col items-start text-left gap-2 mb-5"
                  >
                    <label for="additionally1">Дополнительно</label>
                    <USelect
                      class="w-full"
                      v-model="rowData.additionally"
                      :options="additionallies"
                      option-attribute="name"
                    />
                  </div>
                </div>

                <div class="flex flex-col items-center gap-2 mr-5">
                  <label>Предоплата</label>
                  <input
                    class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                    type="checkbox"
                    required
                    v-model="rowData.dp"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton
                  :disabled="
                    rowData.fromName === '' || rowData.fromName === null
                  "
                  @click="createRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
