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
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteRow(row.id),
    },
  ],
];
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
      <UDropdown :items="items(row)">
        <Icon
          class="text-gray-500"
          size="24"
          name="i-heroicons-ellipsis-horizontal-20-solid"
        />
      </UDropdown>
    </template>
  </UTable>
</template>
