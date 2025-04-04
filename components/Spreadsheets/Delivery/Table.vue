<script setup lang="ts">
import type { PropType } from "vue";
import { read, utils, writeFile } from "xlsx";
import { vAutoAnimate } from "@formkit/auto-animate";
const storeUsers = useUsersStore();

const emit = defineEmits([
  "openModal",
  "deleteRow",
  "updateDeliveryRow",
  "deleteSelectedRows",
  "updateDeliveryRows",
]);

function updateDeliveryRow(row: IDelivery, flag: string) {
  emit("updateDeliveryRow", { row: row, flag: flag });
}

function updateDeliveryRows(flag: string) {
  emit("updateDeliveryRows", { idArray: checkedRows.value, flag: flag });
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

function openModal(row: IDelivery) {
  emit("openModal", row);
}

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function deleteSelectedRows() {
  emit("deleteSelectedRows", checkedRows.value);
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IDelivery[]>, required: true },
  isShowModalValue: { type: Boolean, required: true },
});

function openModalEmit() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

watch([props.isShowModalValue], openModalEmit);

async function exportToExcel() {
  perPage.value = await totalRows.value;
  await updateCurrentPageData();

  let table = document.querySelector(".table-fixed");

  let wb = await utils.table_to_book(table);

  await writeFile(wb, "доставка.xlsx");

  perPage.value = await 100;
  await updateCurrentPageData();
}

interface RowData {
  id: number;
  amount: number;
  paid: Date | null | string | number;
  sorted: Date | null | string | number;
  name: string;
}

const allSum: Ref<RowData[]> = ref([]);
const checkedRows: Ref<number[]> = ref([]);

const getAllSum: Ref<number> = ref(0);
const showButtonPaid: Ref<boolean> = ref(true);
const showButtonSorted: Ref<boolean> = ref(true);

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

const updateRowBackground = (rowId: string, isChecked: boolean): void => {
  const tdElements = document.querySelectorAll("td");
  tdElements.forEach((td) => {
    const linkElement = td.querySelector("a");
    if (linkElement?.innerHTML === rowId) {
      if (isChecked) {
        td.parentElement?.classList.add("bg-orange-100");
      } else {
        td.parentElement?.classList.remove("bg-orange-100");
      }
    }
  });
};

const handleCheckboxChange = (row: IDelivery): void => {
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.id !== row.id);
    updateRowBackground(row.id.toString(), false);
  } else {
    checkedRows.value.push(row.id);
    allSum.value.push({
      id: row.id,
      amount: row.amountFromClient3,
      paid: row.paid,
      sorted: row.sorted,
      name: row.name,
    });
    updateRowBackground(row.id.toString(), true);
  }
  getAllSum.value = allSum.value
    .filter((obj) => obj.paid === null)
    .reduce((sum, obj) => sum + obj.amount, 0);
  showButtonPaid.value = allSum.value.every((obj) => obj.paid === null);
  showButtonSorted.value = allSum.value.every((obj) => obj.sorted === null);
};

const showDeletedRows = ref(false);

const perPage = ref(100);
const currentPage = ref(1);
const totalPages = ref(1);
const totalRows = ref(0);
const totalRowsUpdate = computed(() => Math.ceil(props.rows?.length || 0));
let returnRows = ref<Array<IDelivery>>([]);

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  if (showDeletedRows.value) {
    returnRows.value = props.rows?.slice(startIndex, endIndex);
    totalPages.value = Math.ceil((props.rows?.length || 1) / perPage.value);
    totalRows.value = Math.ceil(props.rows?.length || 0);
  } else {
    returnRows.value = props.rows
      ?.filter((row) => !row.deleted)
      .slice(startIndex, endIndex);
    totalPages.value = Math.ceil(
      (returnRows.value?.length || 1) / perPage.value
    );
    totalRows.value = Math.ceil(returnRows.value?.length || 0);
  }
}

watch([currentPage, totalRows, totalRowsUpdate], updateCurrentPageData);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const toggleShowDeletedRows = () => {
  showDeletedRows.value = !showDeletedRows.value;
  updateCurrentPageData();
};

onMounted(() => {
  updateCurrentPageData();
});

let showOtherOptions = ref(false);

let isAllSelected = ref(false);
function handleCheckboxChangeAll() {
  if (isAllSelected.value) {
    let arrayId = returnRows.value.map((row) => row.id);
    let arraySum = returnRows.value.map((row) => ({
      amount: row.amountFromClient3,
      id: row.id,
      paid: row.paid,
      sorted: row.sorted,
    }));
    checkedRows.value = arrayId;
    allSum.value = arraySum;
    getAllSum.value = allSum.value
      .filter((obj) => obj.paid === null)
      .reduce((sum, obj) => sum + obj.amount, 0);
    showButtonPaid.value = allSum.value.every((obj) => obj.paid === null);
    showButtonSorted.value = allSum.value.every((obj) => obj.sorted === null);
  } else {
    checkedRows.value = [];
    allSum.value = [];
    getAllSum.value = 0;
  }
}

let isOpen = ref(false);

const items = [
  {
    label: "Изменить состояние",
    icon: "mdi:state-machine",
    defaultOpen: true,
    slot: "getting-started",
  },
];

const itemsTable = (row: IDelivery) => [
  [
    {
      label: "Изменить",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => openModal(row),
    },
  ],
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteRow(row.id),
    },
  ],
];

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};

const columns = [
  {
    key: "actions",
  },
  {
    key: "select",
  },
  {
    key: "id",
    label: "ID",
  },
  {
    key: "clientLink3",
    label: "Ссылка кл.",
  },
  {
    key: "name",
    label: "Имя",
  },
  {
    key: "fromName",
    label: "Телефон",
  },
  {
    key: "purchaseOfGoods",
    label: "Стоимость выкупа товара",
  },
  {
    key: "percentClient",
    label: "Процент",
  },
  {
    key: "amountFromClient3",
    label: "Сумма с кл.",
  },
  {
    key: "dispatchPVZ",
    label: "ПВЗ",
  },
  {
    key: "orderPVZ",
    label: "СЦ",
  },
  {
    key: "sorted",
    label: "Отсортировано",
  },
  {
    key: "paid",
    label: "Оплачено",
  },
  {
    key: "additionally",
    label: "Доп.",
  },
  {
    key: "profit",
    label: "Доход",
  },
];
</script>
<template>
  <div>
    <div class="flex items-end justify-between max-lg:block mt-5">
      <div>
        <div
          :class="{ 'h-[170px]': !totalRows }"
          class="flex items-center gap-5"
        >
          <div
            v-if="!showDeletedRows"
            v-auto-animate
            @click="toggleShowDeletedRows"
            class="flex items-center gap-2 w-[220px] bg-green-100 text-green-500 px-2 py-1 font-bold cursor-pointer duration-200 hover:opacity-50 rounded-xl"
          >
            <Icon name="fluent:eye-show-16-filled" size="24" />
            <h1>Показать удаленное</h1>
          </div>
          <div
            v-if="showDeletedRows"
            v-auto-animate
            @click="toggleShowDeletedRows"
            class="flex items-center gap-2 w-[220px] bg-red-100 text-red-500 px-2 py-1 font-bold cursor-pointer duration-200 hover:opacity-50 rounded-xl"
          >
            <Icon name="fluent:eye-hide-20-filled" size="24" />
            <h1>Скрыть удаленное</h1>
          </div>
        </div>
      </div>
      <div
        v-if="totalRows"
        class="flex h-[100px] items-end max-lg:mt-5 max-lg:justify-between gap-20"
      >
        <div class="flex flex-col text-center">
          <h1 class="text-base mb-2">
            Страница: {{ currentPage }} из {{ totalPages }}
          </h1>
          <div class="flex items-center justify-center gap-2">
            <button
              @click="prevPage(), updateCurrentPageData()"
              :disabled="currentPage === 1"
              class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
            >
              <Icon
                name="material-symbols:arrow-back-ios-new-rounded"
                class="text-white"
              />
            </button>
            <button
              @click="nextPage(), updateCurrentPageData()"
              :disabled="currentPage === totalPages"
              class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
            >
              <Icon
                name="material-symbols:arrow-forward-ios-rounded"
                class="text-white"
              />
            </button>
          </div>
        </div>
        <UTooltip
          text="Скачать EXCEL"
          :shortcuts="['xlsx']"
          :popper="{ placement: 'right' }"
        >
          <div
            class="bg-secondary-color cursor-pointer border-[1px] border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
            @click="exportToExcel"
          >
            <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
          </div>
        </UTooltip>
      </div>
    </div>

    <div
      :class="{ 'overflow-x-auto max-2xl:w-screen': isOpen }"
      class="mt-5 mb-10"
    >
      <UTable
        v-if="returnRows.length"
        class="w-full z-[20] overflow-x-visible mx-auto text-center rounded-md mt-5"
        :class="{ 'overflow-x-hidden max-h-[100px]': isShowModalValue }"
        :ui="{ wrapper: 'relative bg-white',
  td: {
    base: 'border-[1px] text-center whitespace-normal',
    padding: 'px-3 py-1',
  },
  th: {
    base: 'text-center uppercase border-t-[1px] border-b-[1px] sticky top-0 z-[20] bg-white',
    padding: 'px-1',
    size: 'text-xs'
  },
  default:
  {
    checkbox:
      { color: 'gray' as any }
  },
    }"
        :rows="returnRows"
        :columns="columns"
      >
        <template #select-data="{ row }">
          <input
            v-if="user.dataDelivery === 'WRITE'"
            class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
            :value="row.id"
            :checked="isChecked(row.id)"
            @change="handleCheckboxChange(row)"
            type="checkbox"
          />
        </template>

        <template #id-data="{ row }">
          <NuxtLink
            target="_blank"
            class="cursor-pointer text-secondary-color hover:opacity-50 duration-200"
            :to="`/spreadsheets/record/3/${row.id}`"
          >
            {{ row.id }}
          </NuxtLink>
        </template>

        <template #clientLink3-data="{ row }">
          <NuxtLink
            v-if="user.clientLink3 === 'READ' || user.clientLink3 === 'WRITE'"
            target="_blank"
            class="cursor-pointer hover:opacity-50 duration-200 bg-secondary-color text-white rounded-sm px-2 py-1 font-bold"
            :to="`/spreadsheets/order/${row.clientLink3}`"
          >
            Перейти
          </NuxtLink>
        </template>

        <template #name-data="{ row }">
          <p v-if="user.name3 === 'READ' || user.name3 === 'WRITE'">
            {{ row.name }}
          </p>
        </template>

        <template #fromName-data="{ row }">
          <NuxtLink
            v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'"
            class="cursor-pointer font-bold text-secondary-color hover:opacity-50 duration-200"
            :to="`/phone/${row.fromName}`"
          >
            {{ row.fromName }}
          </NuxtLink>
        </template>

        <template #purchaseOfGoods-data="{ row }">
          <p
            v-if="
              user.purchaseOfGoods === 'READ' ||
              user.purchaseOfGoods === 'WRITE'
            "
          >
            {{ row.purchaseOfGoods }}
          </p>
        </template>

        <template #percentClient-data="{ row }">
          <p
            v-if="
              user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'
            "
          >
            {{ row.percentClient }}
          </p>
        </template>

        <template #amountFromClien3-data="{ row }">
          <p
            v-if="
              user.amountFromClient3 === 'READ' ||
              user.amountFromClient3 === 'WRITE'
            "
          >
            {{ row.amountFromClient3 }}
          </p>
        </template>

        <template #dispatchPVZ-data="{ row }">
          <p
            v-if="user.dispatchPVZ3 === 'READ' || user.dispatchPVZ3 === 'WRITE'"
          >
            {{ row.dispatchPVZ }}
          </p>
        </template>

        <template #orderPVZ-data="{ row }">
          <p v-if="user.orderPVZ3 === 'READ' || user.orderPVZ3 === 'WRITE'">
            {{ row.orderPVZ }}
          </p>
        </template>

        <template #sorted-data="{ row }">
          <Icon
            @click="updateDeliveryRow(row, 'sorted')"
            v-if="!row.sorted && user.sorted === 'WRITE'"
            class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
            name="mdi:checkbox-multiple-marked-circle"
            size="32"
          />
          <h1 class="font-bold text-green-500">
            {{ row.sorted ? storeUsers.getNormalizedDate(row.sorted) : "" }}
          </h1>
        </template>

        <template #paid-data="{ row }">
          <Icon
            @click="updateDeliveryRow(row, 'paid')"
            v-if="!row.paid && user.paid === 'WRITE'"
            class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
            name="mdi:checkbox-multiple-marked-circle"
            size="32"
          />
          <h1 class="font-bold text-green-500">
            {{ row.paid ? storeUsers.getNormalizedDate(row.paid) : "" }}
          </h1>
        </template>

        <template #additionally-data="{ row }">
          <p
            v-if="
              user.additionally3 === 'READ' || user.additionally3 === 'WRITE'
            "
          >
            {{ row.additionally ? row.additionally : "–" }}
          </p>
        </template>

        <template #profit-data="{ row }">
          <p v-if="user.profit3 === 'READ' || user.profit3 === 'WRITE'">
            {{ row.profit3 }}
          </p>
        </template>

        <template
          v-if="user.username === 'Директор' || user.username === 'Власенкова'"
          #actions-data="{ row }"
        >
          <UDropdown :open="dropdownStates[row.id]" :items="itemsTable(row)">
            <UButton
              variant="ghost"
              color="gray"
              class="text-sm duration-200"
              @touchstart.stop="toggleDropdown(row.id)"
            >
              ...
            </UButton>
          </UDropdown>
        </template>

        <template #expand="{ row }">
          <div class="px-4 py-2 text-left text-sm text-gray-400">
            <h1>
              Дата создания: {{ storeUsers.getNormalizedDate(row.created_at) }}
            </h1>
            <h1>
              Дата последнего изменения:
              {{ storeUsers.getNormalizedDate(row.updated_at) }}
            </h1>
            <h1 v-if="row.deleted">
              Дата удаления: {{ storeUsers.getNormalizedDate(row.deleted) }}
            </h1>
            <h1>Создан: {{ row.createdUser }}</h1>
            <h1>Изменен: {{ row.updatedUser }}</h1>
          </div>
        </template>
      </UTable>
    </div>

    <div
      v-if="checkedRows.length"
      class="absolute z-40 top-72 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    >
      <UButton class="font-bold" @click="isOpen = true"
        >ПОКАЗАТЬ ДОСТУПНЫЕ ФУНКЦИИ</UButton
      >
    </div>
  </div>

  <USlideover
    :class="{ 'overflow-x-auto max-2xl:w-screen': isOpen }"
    v-model="isOpen"
  >
    <UCard
      class="flex flex-col flex-1"
      :ui="{
        body: { base: 'flex-1' },
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <Placeholder class="h-8" />
        <h1>Доступные функции</h1>
        <UButton
          color="orange"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark-20-solid"
          class="flex absolute end-5 top-5 z-10"
          square
          padded
          @click="isOpen = false"
        />
      </template>

      <div
        class="relative max-h-[400px] overflow-y-auto mb-2 border-[1px] border-black"
      >
        <table
          id="theTable"
          class="w-full border-[1px] bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
          v-if="totalRows > 0"
        >
          <thead
            class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center"
          >
            <tr>
              <th
                scope="col"
                class="border-[1px] px-3"
                v-if="user.dataDelivery === 'WRITE'"
              >
                <input
                  class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-full bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                  type="checkbox"
                  v-model="isAllSelected"
                  @change="handleCheckboxChangeAll()"
                />
              </th>
              <th
                scope="col"
                class="border-[1px]"
                v-if="user.name3 === 'READ' || user.name3 === 'WRITE'"
              >
                имя
              </th>
              <th
                scope="col"
                class="border-[1px]"
                v-if="
                  user.amountFromClient3 === 'READ' ||
                  user.amountFromClient3 === 'WRITE'
                "
              >
                сумма
              </th>
              <th
                scope="col"
                class="border-[1px]"
                v-if="user.sorted === 'READ' || user.sorted === 'WRITE'"
              >
                отсорт.
              </th>
              <th
                scope="col"
                class="border-[1px]"
                v-if="user.paid === 'READ' || user.paid === 'WRITE'"
              >
                оплачено
              </th>
            </tr>
          </thead>
          <tbody>
            <div id="left"></div>
            <tr
              :class="{ 'bg-orange-100': isChecked(row.id) }"
              class="border-b text-center text-sm"
              v-for="row in returnRows.filter((row) =>
                allSum.map((item) => item.name).includes(row.name)
              )"
            >
              <td
                v-if="user.dataDelivery === 'WRITE'"
                class="border-[1px] underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[200px]"
              >
                <input
                  class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-full bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
                  type="checkbox"
                  :value="row.id"
                  :checked="isChecked(row.id)"
                  @change="handleCheckboxChange(row)"
                />
              </td>
              <td
                v-if="user.name3 === 'READ' || user.name3 === 'WRITE'"
                class="border-[1px]"
              >
                {{ row.name }}
              </td>
              <td
                class="border-[1px]"
                v-if="
                  user.amountFromClient3 === 'READ' ||
                  user.amountFromClient3 === 'WRITE'
                "
              >
                {{ row.amountFromClient3 }}
              </td>
              <td
                class="border-[1px]"
                v-if="user.sorted === 'READ' || user.sorted === 'WRITE'"
              >
                <h1 class="font-bold text-green-500">
                  {{
                    row.sorted ? storeUsers.getNormalizedDate(row.sorted) : ""
                  }}
                </h1>
              </td>
              <td
                class="border-[1px]"
                v-if="user.paid === 'READ' || user.paid === 'WRITE'"
              >
                <h1 class="font-bold text-green-500">
                  {{ row.paid ? storeUsers.getNormalizedDate(row.paid) : "" }}
                </h1>
              </td>
              <div id="right"></div>
            </tr>
          </tbody>
        </table>
      </div>
      <h1 class="mb-2 text-xl font-medium">
        Выбрано записей: {{ checkedRows.length }}
      </h1>

      <div
        v-if="getAllSum > 0"
        class="mb-5 text-center flex border-2 border-secondary-color rounded-full py-1 items-center justify-center gap-2"
      >
        <h1 class="text-2xl">
          <span class="text-secondary-color font-bold">{{ getAllSum }} ₽</span>
        </h1>
      </div>

      <UAccordion color="orange" :items="items">
        <template #getting-started>
          <div
            class="text-gray-900 dark:text-white text-center items-center justify-center bg-gray-50 py-5 flex flex-col gap-3"
          >
            <UIActionButton
              class="w-full max-w-[300px]"
              v-if="
                user.sorted === 'WRITE' &&
                showButtonSorted &&
                checkedRows.length
              "
              @click="updateDeliveryRows('sorted')"
              >Отсортировано
            </UIActionButton>
            <UIActionButton
              class="w-full max-w-[300px]"
              v-if="
                user.paid === 'WRITE' && showButtonPaid && checkedRows.length
              "
              @click="showOtherOptions = !showOtherOptions"
              >Оплачено
            </UIActionButton>
            <div
              v-if="showOtherOptions"
              class="flex flex-col gap-3 w-full max-w-[300px]"
            >
              <UIActionButton2
                class="w-full max-w-[300px]"
                v-if="user.paid === 'WRITE'"
                @click="updateDeliveryRows('paid1')"
                >Оплачено онлайн
              </UIActionButton2>
              <UIActionButton2
                class="w-full max-w-[300px]"
                v-if="user.paid === 'WRITE'"
                @click="updateDeliveryRows('paid2')"
                >Оплачено наличными
              </UIActionButton2>
            </div>
          </div>
        </template>
      </UAccordion>

      <div
        @click="deleteSelectedRows"
        class="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium text-sm gap-x-1.5 px-2.5 py-1.5 text-red-500 dark:text-red-400 bg-red-50 hover:bg-red-100 rounded-md disabled:bg-red-50 dark:bg-red-950 dark:hover:bg-red-900 dark:disabled:bg-red-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 dark:focus-visible:ring-red-400 inline-flex items-center mb-1.5 w-full cursor-pointer duration-100"
      >
        <Icon name="material-symbols:delete-rounded" size="20" />
        <h1 class="text-sm">Удалить</h1>
      </div>

      <template #footer>
        <Placeholder class="h-8" />
      </template>
    </UCard>
  </USlideover>
</template>
