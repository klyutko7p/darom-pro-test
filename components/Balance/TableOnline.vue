<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore()

defineProps({
  rows: { type: Array as PropType<IBalanceOnline[]> },
});


</script>
<template>
  <div class="relative max-h-[610px] overflow-y-auto mt-5 mb-10">
    <table id="theTable" class="w-full border-[1px] border-gray-50 text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center">
        <tr>
          <th scope="col" class="border-[1px]">
            Сумма
          </th>
          <th scope="col" class="border-[1px]">
            Дата создания
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" class="text-center">
          <th scope="row" class="border-[1px]">
            {{ row.sum }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ storeUsers.getNormalizedDateWithoutTime(row.created_at) }}
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

