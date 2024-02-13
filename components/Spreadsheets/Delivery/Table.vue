<script setup lang="ts">
import type { PropType } from "vue";
import { read, utils, writeFile } from "xlsx";

const storeUsers = useUsersStore();

const emit = defineEmits([
  "openModal",
  "deleteRow",
  "updateDeliveryRow",
  "deleteSelectedRows",
  "updateDeliveryRows",
  "createCopyRow",
]);

function updateDeliveryRow(row: IDelivery, flag: string) {
  emit("updateDeliveryRow", { row: row, flag: flag });
}

function updateDeliveryRows(flag: string) {
  emit("updateDeliveryRows", { idArray: checkedRows.value, flag: flag });
  checkedRows.value = []
  allSum.value = []
  getAllSum.value = 0
}

function openModal(row: IDelivery) {
  emit("openModal", row);
}

function createCopyRow() {
  emit("createCopyRow", checkedRows.value[0]);
  checkedRows.value = []
  allSum.value = []
  getAllSum.value = 0
}

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function deleteSelectedRows() {
  emit("deleteSelectedRows", checkedRows.value);
  checkedRows.value = []
  allSum.value = []
  getAllSum.value = 0
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IDelivery[]> },
});

function exportToExcel() {
  let table = document.querySelector("#theTable");

  let wb = utils.table_to_book(table);

  writeFile(wb, "доставка.xlsx");
}

interface RowData {
  rowId: number;
  amount: number;
  paid: Date | null | string | number;
}

const allSum: Ref<RowData[]> = ref([]);
const checkedRows: Ref<number[]> = ref([]);

const getAllSum: Ref<number> = ref(0);
const showButton: Ref<boolean> = ref(true);

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

const handleCheckboxChange = (row: IDelivery): void => {
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
  } else {
    checkedRows.value.push(row.id);
    allSum.value.push({ rowId: row.id, amount: row.amountFromClient3, paid: row.paid });
  }
  getAllSum.value = allSum.value.filter((obj) => obj.paid === null).reduce((sum, obj) => sum + obj.amount, 0);
  showButton.value = allSum.value.every(obj => obj.paid === null);
};

const showDeletedRows = ref(false);

const perPage = ref(100)
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil((props.rows?.length || 0) / perPage.value));
const totalRows = computed(() => Math.ceil(props.rows?.length || 0));
let returnRows = ref<Array<IDelivery>>()

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value
  const endIndex = startIndex + perPage.value

  if (showDeletedRows.value) {
    returnRows.value = props.rows?.slice(startIndex, endIndex);
  } else {
    returnRows.value = props.rows?.filter((row) => !row.deleted).slice(startIndex, endIndex);
  }
}

watch([currentPage, totalRows], updateCurrentPageData)

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const toggleShowDeletedRows = () => {
  showDeletedRows.value = !showDeletedRows.value;
  updateCurrentPageData();
};

onMounted(() => {
  updateCurrentPageData()
})


</script>
<template>
  <div class="flex items-center justify-between max-lg:block mt-10">
    <div>
      <div class="flex items-center gap-5">
        <UIActionButton @click="toggleShowDeletedRows">
          {{ showDeletedRows ? 'Скрыть удаленное' : 'Показать удаленное' }}
        </UIActionButton>
      </div>
    </div>
    <div class="flex items-end max-lg:mt-5 max-lg:justify-between gap-20">
      <div class="flex flex-col text-center">
        <h1 class="text-base">Страница:</h1>
        <h1 class="text-base mb-2"> {{ currentPage }} из {{ totalPages }} </h1>
        <div class="flex items-center justify-center gap-2">
          <button @click="prevPage(), updateCurrentPageData()" :disabled="currentPage === 1"
            class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3">
            <Icon name="material-symbols:arrow-back-ios-new-rounded" class="text-white" />
          </button>
          <button @click="nextPage(), updateCurrentPageData()" :disabled="currentPage === totalPages"
            class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3">
            <Icon name="material-symbols:arrow-forward-ios-rounded" class="text-white" />
          </button>
        </div>
      </div>
      <Icon class="duration-200 hover:text-secondary-color cursor-pointer" size="40" name="material-symbols:sheets-add-on"
        @click="exportToExcel" />
    </div>
  </div>

  <div class="fixed top-24 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]" v-if="getAllSum > 0">
    <h1 class="text-base backdrop-blur-xl p-2 rounded-xl border-2 text-secondary-color font-bold">К оплате: {{
      getAllSum }} </h1>
  </div>

  <div class="fixed z-40 flex flex-col gap-3 top-64 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    v-if="user.dataDelivery === 'WRITE' && checkedRows.length > 0 && user.role !== 'PVZ'">
    <UIActionButton
      v-if="user.dataDelivery === 'WRITE' && (user.role === 'ADMIN' || user.username === 'ОПТ') && checkedRows.length === 1"
      @click="createCopyRow">Скопировать запись</UIActionButton>
    <UIActionButton v-if="user.role === 'ADMIN' && user.dataDelivery === 'WRITE'"
      @click="deleteSelectedRows">Удалить
      выделенные записи</UIActionButton>
    <UIActionButton v-if="user.sorted === 'WRITE'" @click="updateDeliveryRows('sorted')">Отсортировано
    </UIActionButton>
    <UIActionButton v-if="user.paid === 'WRITE'" @click="updateDeliveryRows('paid')">Оплачено
    </UIActionButton>
  </div>

  <div class="relative max-h-[610px] mt-5 mb-10">
    <div id="up"></div>
    <table id="theTable" class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      v-if="totalRows > 0">
      <thead class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50">
        <tr>
          <th scope="col" class="border-2" v-if="user.dataDelivery === 'WRITE'">
            Выделение
          </th>
          <th scope="col" class="exclude-row border-2" v-if="user.dataDelivery === 'WRITE' && user.role === 'ADMIN'">
            изменение
          </th>
          <th scope="col" class="border-2">id</th>
          <th scope="col" class="border-2" v-if="user.clientLink3 === 'READ' || user.clientLink3 === 'WRITE'">
            ссылка для клиента
          </th>
          <th scope="col" class="border-2" v-if="user.name3 === 'READ' || user.name3 === 'WRITE'">
            имя
          </th>
          <th scope="col" class="border-2" v-if="user.fromName3 === 'READ' || user.fromName3 === 'WRITE'">
            телефон
          </th>
          <th scope="col" class="border-2" v-if="user.nameOfAction === 'READ' || user.nameOfAction === 'WRITE'">
            название
          </th>
          <th scope="col" class="border-2" v-if="user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE'">
            стоимость выкупа товара
          </th>
          <th scope="col" class="border-2" v-if="user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'">
            процент с клиента (%)
          </th>
          <th scope="col" class="border-2" v-if="user.amountFromClient3 === 'READ' || user.amountFromClient3 === 'WRITE'">
            сумма с клиента
          </th>
          <th scope="col" class="border-2" v-if="user.dispatchPVZ3 === 'READ' || user.dispatchPVZ3 === 'WRITE'">
            отправка <br> в пвз
          </th>
          <th scope="col" class="border-2" v-if="user.orderPVZ3 === 'READ' || user.orderPVZ3 === 'WRITE'">
            заказано <br> на сц
          </th>
          <th scope="col" class="border-2" v-if="user.sorted === 'READ' || user.sorted === 'WRITE'">
            отсортировано
          </th>
          <th scope="col" class="border-2" v-if="user.paid === 'READ' || user.paid === 'WRITE'">
            оплачено
          </th>
          <th scope="col" class="border-2 text-[10px]" v-if="user.additionally3 === 'READ' || user.additionally3 === 'WRITE'">
            дополнительно
          </th>
          <th scope="col" class="border-2" v-if="user.profit3 === 'READ' || user.profit3 === 'WRITE'">
            прибыль (доход)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">создан (время)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">изменен (время)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">удален (время)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">создан</th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">изменен</th>
          <th scope="col" class="exclude-row border-2" v-if="user.dataDelivery === 'WRITE' && user.role === 'ADMIN'">
            удаление
          </th>
        </tr>
      </thead>
      <tbody>
        <div id="left"></div>
        <tr :class="{ 'bg-orange-100': isChecked(row.id) }" class="border-b text-center text-sm"
          v-for="row in returnRows">
          <td v-if="user.dataDelivery === 'WRITE'"
            class="border-2 underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[200px]">
            <input type="checkbox" :value="row.id" :checked="isChecked(row.id)" @change="handleCheckboxChange(row)" />
          </td>
          <td class="border-2"
            v-if="user.dataDelivery === 'WRITE' && user.role === 'ADMIN'">
            <Icon @click="openModal(row)" class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              name="material-symbols:edit" size="32" />
          </td>
          <th scope="row" class="border-2 font-medium underline text-secondary-color whitespace-nowrap">
            <NuxtLink target="_blank" class="cursor-pointer hover:text-orange-200 duration-200"
              :to="`/spreadsheets/record/3/${row.id}`">
              {{ row.id }}
            </NuxtLink>
          </th>
          <td class="border-2 underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[50px]"
            v-if="user.clientLink3 === 'READ' || user.clientLink3 === 'WRITE'">
            <NuxtLink target="_blank" class="cursor-pointer hover:text-orange-200 duration-200"
              :to="`/spreadsheets/order/${row.clientLink3}`">
              {{ row.clientLink3 }}
            </NuxtLink>
          </td>
          <td v-if="user.name3 === 'READ' || user.name3 === 'WRITE'" class="border-2 whitespace-nowrap">
            {{ row.name }}
          </td>
          <td v-if="user.fromName3 === 'READ' || user.fromName3 === 'WRITE'" class="border-2">
            {{ row.fromName }}
          </td>
          <td v-if="user.nameOfAction === 'READ' || user.nameOfAction === 'WRITE'" class="border-2">
            {{ row.nameOfAction }}
          </td>
          <td class="border-2" v-if="user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE'">
            {{ row.purchaseOfGoods }}
          </td>
          <td class="border-2" v-if="user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'">
            {{ row.percentClient }}
          </td>
          <td class="border-2" v-if="user.amountFromClient3 === 'READ' || user.amountFromClient3 === 'WRITE'">
            {{ row.amountFromClient3 }}
          </td>
          <td class="border-2" v-if="user.dispatchPVZ3 === 'READ' || user.dispatchPVZ3 === 'WRITE'">
            {{ row.dispatchPVZ }}
          </td>
          <td class="border-2" v-if="user.orderPVZ3 === 'READ' || user.orderPVZ3 === 'WRITE'">
            {{ row.orderPVZ }}
          </td>
          <td class="border-2" v-if="user.sorted === 'READ' || user.sorted === 'WRITE'">
            <Icon @click="updateDeliveryRow(row, 'sorted')" v-if="!row.sorted && user.sorted === 'WRITE'"
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle" size="32" />
            <h1 class="font-bold text-green-500">
              {{ row.sorted ? storeUsers.getNormalizedDate(row.sorted) : "" }}
            </h1>
          </td>
          <td class="border-2" v-if="user.paid === 'READ' || user.paid === 'WRITE'">
            <Icon @click="updateDeliveryRow(row, 'paid')" v-if="!row.paid && user.paid === 'WRITE'"
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle" size="32" />
            <h1 class="font-bold text-green-500">
              {{ row.paid ? storeUsers.getNormalizedDate(row.paid) : "" }}
            </h1>
          </td>
          <td class="border-2" v-if="user.additionally3 === 'READ' || user.additionally3 === 'WRITE'">
            {{ row.additionally ? row.additionally : "Пусто" }}
          </td>
          <td class="border-2" v-if="user.profit3 === 'READ' || user.profit3 === 'WRITE' && user.username !== 'ОПТ'">
            {{ row.profit3 }}
          </td>
          <td class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">
            {{ storeUsers.getNormalizedDate(row.created_at) }}
          </td>
          <td class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">
            {{ storeUsers.getNormalizedDate(row.updated_at) }}
          </td>
          <td class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">
            {{ storeUsers.getNormalizedDate(row.deleted) }}
          </td>
          <td class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">
            {{ row.createdUser }}
          </td>
          <td class="border-2" v-if="user.role === 'ADMIN' || user.username === 'ОПТ'">
            {{ row.updatedUser }}
          </td>
          <td class="border-2"
            v-if="user.dataDelivery === 'WRITE' && user.role === 'ADMIN'">
            <Icon @click="deleteRow(row.id)" class="text-red-600 cursor-pointer hover:text-red-300 duration-200"
              name="material-symbols:playlist-remove-rounded" size="32" />
          </td>
          <div id="right"></div>
        </tr>
      </tbody>
    </table>
    <div v-else class="flex items-center flex-col justify-center m-10 text-2xl">
      <Icon name="ion:ios-close-empty" size="100" class="text-red-500" />
      <h1>Извините, записи по данным фильтрам не были найдены!</h1>
      <h1>Попробуйте поставить другие фильтры или очистить их</h1>
    </div>
    <div id="down"></div>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
