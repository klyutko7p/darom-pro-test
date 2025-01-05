<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";
import { vAutoAnimate } from "@formkit/auto-animate";
import { useToast } from "vue-toastification";

const toast = useToast();

const storePVZPercent = usePVZPercentStore();

const emit = defineEmits([
  "updateStateRows",
  "updatePVZRows",
  "updateDecommissionedRows",
  "deleteRow",
  "openModal",
]);

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IPVZPercent[]> },
});

const checkedRows: Ref<number[]> = ref([]);

onMounted(async () => {
  updateCurrentPageData();
});

const storeUsers = useUsersStore();
let isLoading = ref(false);
let isOpen = ref(false);
let filteredRows = ref<Array<IPVZPercent>>([]);

function updateCurrentPageData() {
  filteredRows.value = props.rows;
}

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function openModal(row: Task) {
  emit("openModal", row);
}

watch([props.rows, props.user], updateCurrentPageData);

const columns = [
  {
    key: "actions",
  },
  {
    key: "pvz",
    label: "ПВЗ",
  },
  {
    key: "wb",
    label: "% Wildberries",
  },
  {
    key: "ozon",
    label: "% Ozon",
  },
  {
    key: "ym",
    label: "% Яндекс Маркет",
  },
];

const items = (row: Task) => [
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

let arrayWithModifiedRows = ref<Array<IPVZPercent>>([]);
async function getRowByIdFromInput(row: IPVZPercent) {
  arrayWithModifiedRows.value.push(row);
  arrayWithModifiedRows.value = [...new Set(arrayWithModifiedRows.value)];
  await storePVZPercent.updatePVZPercents(arrayWithModifiedRows.value);
}
</script>

<template>
  <div v-if="!isLoading">
    <UTable
      v-if="filteredRows.length"
      class="w-full max-h-[250px] text-center bg-white border-[1px] rounded-md"
      :ui="{
  td: {
    base: 'border-r-[1px] border-b-[1px] text-center whitespace-normal',
    padding: 'px-3 py-1',
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
      :columns="columns"
    >
      <template #pvz-data="{ row }">
        {{ row.pvz.name }}
      </template>

      <template #wb-data="{ row }">
        <input
          autoresize
          :disabled="
            user.username !== 'Директор' && user.username !== 'Власенкова'
          "
          @blur="getRowByIdFromInput(row)"
          v-model="row.wb"
          class="min-w-[170px] w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
          type="number"
        />
        <span class="hidden">{{ row.wb }} </span>
      </template>

      <template #ozon-data="{ row }">
        <input
          autoresize
          :disabled="
            user.username !== 'Директор' && user.username !== 'Власенкова'
          "
          @blur="getRowByIdFromInput(row)"
          v-model="row.ozon"
          class="min-w-[170px] w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
          type="number"
        />
        <span class="hidden">{{ row.ozon }} </span>
      </template>

      <template #ym-data="{ row }">
        <input
          autoresize
          :disabled="
            user.username !== 'Директор' && user.username !== 'Власенкова'
          "
          @blur="getRowByIdFromInput(row)"
          v-model="row.ym"
          class="min-w-[170px] w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
          type="number"
        />
        <span class="hidden">{{ row.ym }} </span>
      </template>

      <template #actions-data="{ row }">
        <UDropdown
          v-if="
            user.username === 'Директор' ||
            user.username === 'Власенкова' ||
            user.username === 'Горцуева'
          "
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

    <div v-else class="flex items-center justify-center flex-col gap-3 mt-10">
      <h1 class="text-2xl">Записи не найдены</h1>
      <Icon name="fluent-emoji:sad-but-relieved-face" size="40" />
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
