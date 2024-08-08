<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  rows: { type: Array as PropType<IBalanceOnline[]> },
});


</script>
<template>
  <div class="relative max-h-[610px] overflow-y-auto rounded-xl mt-5 mb-10">
    <table  class="w-full border-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center">
        <tr>
          <th scope="col" class="border-2">
            Сумма
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" class="text-center">
          <th scope="row" class="border-2">
            {{ row.sum }}
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

