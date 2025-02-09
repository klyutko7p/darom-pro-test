<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();
import { read, utils, writeFile, write } from "xlsx";

const emit = defineEmits(["openModal", "updateDeliveryRow", "deleteRow"]);

function updateDeliveryRow(row: IAdvanceReport) {
  emit("updateDeliveryRow", { row: row });
}

function deleteRow(id: number) {
  emit("deleteRow", { id });
}

function openModal(row: IAdvanceReport) {
  emit("openModal", row);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
});

const filteredRows = ref(props.rows);
const perPage = ref(100);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil((props.rows?.length || 0) / perPage.value)
);
const totalRows = computed(() => Math.ceil(props.rows?.length || 0));

let columns = [
  {
    key: "actions",
  },
  {
    key: "date",
    label: "Дата",
  },
  {
    key: "PVZ",
    label: "ПВЗ",
  },
  {
    key: "expenditure1",
    label: "Приход",
  },
  {
    key: "expenditure2",
    label: "Расход",
  },
  {
    key: "typeOfExpenditure",
    label: "Статья расхода",
  },
  {
    key: "notation",
    label: "Комментарий",
  },
  {
    key: "createdUser",
    label: "Создано",
  },
  {
    key: "issuedUser",
    label: "Получил",
  },
  {
    key: "supportingDocuments",
    label: "Документ",
  },
  {
    key: "received",
    label: "Получено",
  },
  {
    key: "created_at",
    label: " Дата создания",
  },
];

onMounted(() => {
  updateCurrentPageData();

  if (
    props.user.username !== "Директор" &&
    props.user.username !== "Власенкова"
  ) {
    columns.splice(0, 1);
    columns.splice(12, 1);
    columns.splice(11, 1);
  }

  selectedColumns.value = columns;

  let storageSelectedColumns = localStorage.getItem(
    "advanceReportSelectedCols"
  );
  let storageColumns = localStorage.getItem("advanceReportColumns");
  let storageTableColumns = localStorage.getItem("advanceReportTableColumns");
  if (storageColumns && storageSelectedColumns) {
    try {
      const parsedSelectedColumns = JSON.parse(storageSelectedColumns);
      const parsedColumns = JSON.parse(storageColumns);

      if (parsedColumns.length) {
        selectedColumns.value = parsedSelectedColumns;
        columns = parsedColumns;
      }
    } catch (e) {
      console.error("Error parsing stored columns:", e);
    }
  }

  columnsTable.value = columns.filter((column) => {
    return selectedColumns.value?.some(
      (selectedColumn: any) => selectedColumn.key === column.key
    );
  });
});

let returnRows = ref<Array<IAdvanceReport>>();

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  returnRows.value = props.rows?.slice(startIndex, endIndex);
  filteredRows.value = returnRows.value;
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);

async function exportToExcel() {
  perPage.value = await totalRows.value;
  await updateCurrentPageData();
  let table = document.querySelector(".table-fixed");
  let wb = utils.table_to_book(table);
  await writeFile(wb, "авансовый_отчёт.xlsx");
  perPage.value = await 100;
  await updateCurrentPageData();
}

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

const items = (row: IAdvanceReport) => [
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

const selectedColumns = ref([] as any);
let columnsTable = ref(
  columns.filter((column) => selectedColumns.value?.includes(column))
);

watch([selectedColumns], saveSelectedColumns);
function saveSelectedColumns() {
  localStorage.setItem(
    "advanceReportSelectedCols",
    JSON.stringify(selectedColumns.value)
  );
  localStorage.setItem("advanceReportColumns", JSON.stringify(columns));

  columnsTable.value = columns.filter((column) => {
    return selectedColumns.value?.some(
      (selectedColumn: any) => selectedColumn.key === column.key
    );
  });
}

function clearColumns() {
  localStorage.removeItem("advanceReportSelectedCols");

  if (
    props.user.username !== "Директор" &&
    props.user.username !== "Власенкова"
  ) {
    columns.splice(0, 1);
    columns.splice(12, 1);
    columns.splice(11, 1);
  }

  selectedColumns.value = columns;

  columnsTable.value = columns.filter((column) => {
    return selectedColumns.value?.some(
      (selectedColumn: any) => selectedColumn.key === column.key
    );
  });
}
const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};
let isVisiblePages = ref(true);
</script>
<template>
  <div class="flex items-end justify-between mt-5">
    <div class="flex flex-col text-center" v-if="isVisiblePages">
      <h1 class="text-sm">Страница:</h1>
      <h1 class="text-sm mb-2">{{ currentPage }} из {{ totalPages }}</h1>
      <div class="flex items-center justify-center gap-2">
        <button
          @click="prevPage(), updateCurrentPageData()"
          :disabled="currentPage === 1"
          class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
        >
          <Icon
            name="material-symbols:arrow-back-ios-new-rounded"
            size="10"
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
            size="10"
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
        class="bg-secondary-color cursor-pointer border-2 border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
        @click="exportToExcel"
      >
        <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
      </div>
    </UTooltip>
  </div>

  <div class="w-full flex items-center gap-3 justify-end z-[50] mt-5">
    <USelectMenu
      class="w-[200px] z-[50]"
      v-model="selectedColumns"
      :options="columns"
      multiple
    >
      <UButton
        class="w-[200px] z-[50]"
        icon="i-heroicons-view-columns"
        color="gray"
        size="xs"
      >
        Столбцы
      </UButton>
    </USelectMenu>
    <Icon
      class="hover:bg-secondary-color duration-200 cursor-pointer"
      name="pajamas:clear-all"
      @click="clearColumns"
    />
  </div>

  <UTable
    class="w-full mx-auto text-center bg-white border-[1px] rounded-md mt-5 max-h-[390px]"
    :ui="{
  td: {
    base: 'border-[1px] text-center whitespace-normal',
    padding: 'px-3 py-2',
  },
  th: {
    base: 'text-center uppercase sticky top-0 z-[20] bg-white',
    padding: 'px-1',
    size: 'text-xs'
  },
  default:
  {
    checkbox:
      { color: 'gray' as any }
  },
    }"
    :rows="filteredRows"
    :columns="columnsTable"
    sort-asc-icon="i-heroicons-arrow-up"
    sort-desc-icon="i-heroicons-arrow-down"
  >
    <template #date-data="{ row }">
      <p>
        {{ storeUsers.getNormalizedDateWithoutTime(row.date) }}
      </p>
    </template>

    <template #PVZ-data="{ row }">
      <p>
        {{ row.PVZ ? row.PVZ : "—" }}
      </p>
    </template>

    <template #expenditure1-data="{ row }">
      <p>
        {{
          row.typeOfExpenditure === "Перевод с баланса нал" ||
          row.typeOfExpenditure === "Перевод с баланса безнал" ||
          row.typeOfExpenditure === "Новый кредит нал" ||
          row.typeOfExpenditure === "Постоплата WB" ||
          row.typeOfExpenditure === "Новый кредит безнал" ||
          row.typeOfExpenditure === "Пополнение баланса" ||
          row.typeOfExpenditure === "Удержания с сотрудников"
            ? row.expenditure
            : 0
        }}
      </p>
    </template>

    <template #expenditure2-data="{ row }">
      <p>
        {{
          row.typeOfExpenditure !== "Перевод с баланса нал" &&
          row.typeOfExpenditure !== "Перевод с баланса безнал" &&
          row.typeOfExpenditure !== "Новый кредит нал" &&
          row.typeOfExpenditure !== "Постоплата WB" &&
          row.typeOfExpenditure !== "Новый кредит безнал" &&
          row.typeOfExpenditure !== "Пополнение баланса" &&
          row.typeOfExpenditure !== "Удержания с сотрудников"
            ? row.expenditure
            : 0
        }}
      </p>
    </template>

    <template #typeOfExpenditure-data="{ row }">
      <p>
        {{ row.typeOfExpenditure }}
      </p>
    </template>

    <template #notation-data="{ row }">
      <p>
        {{ row.notation ? row.notation : "—" }}
      </p>
    </template>

    <template #createdUser-data="{ row }">
      <p>
        {{ row.createdUser }}
      </p>
    </template>

    <template #issuedUser-data="{ row }">
      <p>
        {{ row.issuedUser ? row.issuedUser : "—" }}
      </p>
    </template>

    <template #supportingDocuments-data="{ row }">
      <a
        target="_blank"
        class="text-secondary-color hover:opacity-60 duration-200 font-bold"
        v-if="row.supportingDocuments && row.supportingDocuments.length > 2"
        :href="`https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/image/img-${row.supportingDocuments}`"
      >
        Фото
      </a>
      <h1 v-else>—</h1>
    </template>

    <template #received-data="{ row }">
      <Icon
        @click="updateDeliveryRow(row)"
        v-if="
          (user.username === row.issuedUser && !row.received) ||
          ((user.username === 'Директор' || user.username === 'Власенкова') &&
            row.issuedUser === 'Директор (С)' &&
            !row.received)
        "
        class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle"
        size="32"
      />
      <h1 class="font-bold text-green-500">
        {{ row.received ? storeUsers.getNormalizedDate(row.received) : "" }}
      </h1>
      <h1 v-if="!row.received && !row.issuedUser">—</h1>
    </template>

    <template #created_at-data="{ row }">
      <p>
        {{ storeUsers.getNormalizedDate(row.created_at) }}
      </p>
    </template>

    <template #actions-data="{ row }">
      <UDropdown
        v-if="user.username === 'Директор' || user.username === 'Власенкова'"
        :open="dropdownStates[row.id]"
        :items="items(row)"
      >
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
  </UTable>
</template>
