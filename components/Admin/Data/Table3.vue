<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  fields: { type: Array as PropType<String[]>, required: true },
  rows: { type: Array as any },
});

const sortedRows = props.rows.slice().sort((a: any, b: any) => {
  const pvzComparison = a.PVZ.localeCompare(b.PVZ);

  if (pvzComparison !== 0) {
    return pvzComparison;
  }

  const numA = parseInt(a.name);
  const numB = parseInt(b.name);
  return numA - numB;
});

const columns = [
  {
    key: "name",
    label: "Название",
  },
  {
    key: "PVZ",
    label: "ПВЗ",
  },
  {
    key: "status",
    label: "Статус",
  },
  {
    key: "fromName",
    label: "Занято",
  },
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

    <template #pvz-data="{ row }">
      <span>{{ row.pvz }}</span>
    </template>

    <template #status-data="{ row }">
      <span v-if="row.status === 'Занято'" class="text-red-500 font-semibold">{{
        row.status
      }}</span>
      <span
        v-if="row.status === 'Свободно'"
        class="text-green-500 font-semibold"
        >{{ row.status }}</span
      >
    </template>

    <template #fromName-data="{ row }">
      <span>{{ row.fromName }}</span>
    </template>
  </UTable>
</template>
