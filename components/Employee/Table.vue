<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "deleteRow"]);

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function openModal(row: IEmployee) {
  emit("openModal", row);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IEmployee[]> },
});

onMounted(() => {
  updateCurrentPageData();
});

const totalRows = computed(() => Math.ceil(props.rows?.length));
let returnRows = ref<Array<IEmployee>>();

function updateCurrentPageData() {
  returnRows.value = props.rows?.sort((a, b) => {
    return a.fullname.localeCompare(b.fullname, "ru");
  });
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);

const columns = [
  {
    key: "PVZ",
    label: "ПВЗ",
    sortable: true,
  },
  {
    key: "company",
    label: "Компания",
    sortable: true,
  },
  {
    key: "fullname",
    label: "ФИО",
    sortable: true,
  },
  {
    key: "job",
    label: "Должность",
  },
  {
    key: "phone",
    label: "Телефон/Карта",
  },
  {
    key: "bank",
    label: "Банк",
  },
  {
    key: "paymentPerShift",
    label: "Оплата в смену",
    sortable: true,
  },
  {
    key: "hoursPerShift",
    label: "Часов в смене",
    sortable: true,
  },
  {
    key: "payroll",
    label: "Оплата в час",
  },
  {
    key: "actions",
  },
];

const items = (row: IEmployee) => [
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
</script>
<template>
  <UTable
    class="w-full text-center bg-white border-[1px] rounded-md mt-5"
    :ui="{ td: { base: 'border-[1px]' }, th: {base: 'text-center'}, default: { checkbox: { color: 'gray' as any } } }"
    :rows="rows"
    :columns="columns"
  >
    <template #payroll-data="{ row }">
      <p v-if="row.paymentPerShift !== null && row.hoursPerShift !== null">
        {{ (row.paymentPerShift / row.hoursPerShift).toFixed(2) }}
      </p>
      <p class="border-[1px] whitespace-nowrap" v-else>0</p>
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
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

tr:nth-child(even) {
  background-color: #f2f2f2; /* Цвет для четных строк */
}
</style>
