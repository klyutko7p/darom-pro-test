<script setup lang="ts">
import type { PropType } from "vue";

const emit = defineEmits(["openModal", "deleteRow"]);

function openModal(row: any) {
  emit("openModal", row);
}

function deleteRow(id: number) {
  emit("deleteRow", id);
}

defineProps({
  fields: { type: Array as PropType<String[]>, required: true },
  rows: { type: Array as any },
});

const columns = [
  {
    key: "name",
    label: "Название",
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
    class="w-full text-center bg-white border-[1px] rounded-md"
    :ui="{ td: { base: '' }, th: {base: 'text-center'}, default: { checkbox: { color: 'gray' as any } } }"
    :rows="rows"
    :columns="columns"
  >
    <template #name-data="{ row }">
      <span>{{ row.name }}</span>
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
