<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";

const emit = defineEmits(["deleteRow"]);

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  allPVZ: { type: Array as PropType<PVZ[]>, required: true },
  rows: {
    type: Array as PropType<IDecommissionedEquipmentRow[]>,
    required: true,
  },
});

async function exportToExcel() {
  perPage.value = await totalRows.value;

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);
  await writeFile(wb, "списанное_оборудование.xlsx");

  perPage.value = await 20000;
}

const perPage = ref(20000);
const currentPage = ref(1);
const totalRows = computed(() =>
  Math.ceil(props.rows.filter((row) => row.deleted === null).length || 0)
);

let returnRows = ref<Array<IDecommissionedEquipmentRow>>([]);
let filteredRows = ref<Array<IDecommissionedEquipmentRow>>([]);

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  returnRows.value = props.rows.slice(startIndex, endIndex);
  returnRows.value = props.rows.filter((row) => row.deleted === null);

  filteredRows.value = returnRows.value;
}

onMounted(async () => {
  updateCurrentPageData();
});

const storeUsers = useUsersStore();
let isLoading = ref(false);
let selectedPVZ = ref(111111);

function deleteRow(id: number) {
  emit("deleteRow", id);
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);

const columns = [
  {
    key: "decommissionDate",
    label: "Списано",
  },
  {
    key: "nameOfEquipment",
    label: "Название",
  },
  {
    key: "reason",
    label: "Причина",
  },
  {
    key: "updatedUser",
    label: "Изменил",
  },
  {
    key: "updated_at",
    label: "Дата изменения",
  },
  {
    key: "pvz",
    label: "ПВЗ",
  },
  {
    key: "decommissionedUser",
    label: "Списал",
  },
  {
    key: "actions",
  },
];

const items = (row: IDecommissionedEquipmentRow) => [
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
</script>

<template>
  <div v-if="!isLoading">
    <div class="flex items-end justify-between mb-5">
      <div>
        <h1 class="text-lg max-sm:text-lg font-semibold mb-3">
          Строк в таблице:
          <span class="text-secondary-color">{{ totalRows }} шт.</span>
        </h1>
      </div>
      <div
        class="flex items-end max-sm:mt-2 max-lg:mt-5 max-lg:justify-between gap-20"
      >
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
    </div>

  
    <UTable
      v-if="filteredRows.length"
      class="w-full text-center bg-white border-[1px] rounded-md"
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
      <template #decommissionDate-data="{ row }">
        {{ storeUsers.getNormalizedDate(row.decommissionDate) }}
      </template>

      <template #nameOfEquipment-data="{ row }">
        {{ row.equipmentRow.nameOfEquipment }}
      </template>

      <template #updated_at-data="{ row }">
        {{ storeUsers.getNormalizedDate(row.equipmentRow.updated_at) }}
      </template>

      <template #updatedUser-data="{ row }">
        {{ row.equipmentRow.updatedUser.username }}
      </template>

      <template #pvz-data="{ row }">
        {{ row.equipmentRow.pvz.name }}
      </template>

      <template #decommissionedUser-data="{ row }">
        {{ row.decommissionedUser.username }}
      </template>

      <template #state-data="{ row }">
        <UBadge
          v-if="row.state === 'Исправное'"
          size="xs"
          label="Исправное"
          color="emerald"
          variant="subtle"
        />
        <UBadge
          v-if="row.state === 'Требуется ремонт'"
          size="xs"
          label="Требуется ремонт"
          color="orange"
          variant="subtle"
        />
        <UBadge
          v-if="row.state === 'Неисправное'"
          size="xs"
          label="Неисправное"
          color="red"
          variant="subtle"
        />
      </template>

      <template #actions-data="{ row }">
        <UDropdown :open="dropdownStates[row.id]" :items="items(row)">
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
      <h1 class="text-2xl">Оборудование не найдено</h1>
      <Icon name="fluent-emoji:sad-but-relieved-face" size="40" />
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
