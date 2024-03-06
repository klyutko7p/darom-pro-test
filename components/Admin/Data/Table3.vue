<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  fields: { type: Array as PropType<String[]>, required: true },
  rows: { type: Array as any },
});

const sortedRows = props.rows.slice().sort((a, b) => {
  const pvzComparison = a.PVZ.localeCompare(b.PVZ);

  if (pvzComparison !== 0) {
    return pvzComparison;
  }

  const numA = parseInt(a.name);
  const numB = parseInt(b.name);
  return numA - numB; 
});
</script>

<template>
  <div class="relative overflow-x-auto mt-5">
    <table class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs text-gray-700 uppercase text-center bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3" v-for="field in fields">{{ field }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-white border-b text-center" v-for="row in sortedRows">
          <th scope="row" class="px-6 py-4 border-2 font-medium text-gray-900 whitespace-nowrap">
            {{ row.name }}
          </th>
          <th scope="row" class="px-6 py-4 border-2 font-medium text-gray-900 whitespace-nowrap">
            {{ row.PVZ }}
          </th>
          <th scope="row" class="px-6 py-4 border-2 font-medium text-gray-900 whitespace-nowrap">
            {{ row.status }}
          </th>
          <th scope="row" class="px-6 py-4 border-2 font-medium text-gray-900 whitespace-nowrap">
            {{ row.fromName }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>
