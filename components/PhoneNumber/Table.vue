<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal"]);

function openModal(row: IPhoneNumber) {
  emit("openModal", row);
}

defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IPhoneNumber[]> },
});

const columns = [
  {
    key: "number",
    label: "Телефон",
    sortable: true,
  },
  {
    key: "address",
    label: "Адрес",
    sortable: true,
  },
  {
    key: "actions",
  },
];

const items = (row) => [
  [
    {
      label: "Изменить",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => openModal(row),
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
    class="w-full text-center bg-white border-[1px] rounded-md"
    :ui="{ td: { base: '' }, th: {base: 'text-center'}, default: { checkbox: { color: 'gray' as any } } }"
    :rows="rows"
    :columns="columns"
  >
    <template #name-data="{ row }">
      <span>{{ row.name }}</span>
    </template>

    <template #address-data="{ row }">
      <span>{{ row.address }}</span>
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
