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
</script>

<template>
  <div class="relative overflow-x-auto overflow-y-auto mt-5">
    <table
      id="theTable"
      class="w-full bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
      >
        <tr>
          <th scope="col" class="px-6 py-3 border-[1px]" v-for="field in fields">
            {{ field }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-white text-center" v-for="row in sortedRows">
          <th
            scope="row"
            class="py-1 border-[1px] font-medium text-gray-900 whitespace-nowrap"
          >
            {{ row.name }}
          </th>
          <th
            scope="row"
            class="py-1 border-[1px] font-medium text-gray-900 whitespace-nowrap"
          >
            {{ row.PVZ }}
          </th>
          <th
            scope="row"
            class="py-3 border-[1px] font-medium text-gray-900 whitespace-nowrap"
            v-if="row.status === 'Занято'"
          >
            <h1
              class="bg-red-100 text-red-500 mx-auto rounded-full max-w-[120px]"
            >
              Занято
            </h1>
          </th>
          <th
            scope="row"
            class="py-3 border-[1px] font-medium text-gray-900 whitespace-nowrap"
            v-if="row.status === 'Свободно'"
          >
            <h1
              class="bg-green-100 text-green-500 mx-auto rounded-full max-w-[120px]"
            >
              Свободно
            </h1>
          </th>
          <th
            scope="row"
            class="py-1 border-[1px] font-medium text-gray-900 whitespace-nowrap"
          >
            {{ row.fromName }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

tr:nth-child(even) {
  background-color: #f2f2f2; /* Цвет для четных строк */
}
</style>
