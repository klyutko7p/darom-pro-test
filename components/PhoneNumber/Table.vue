<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const emit = defineEmits([
  "openModal",
]);

function openModal(row: IPhoneNumber) {
  emit("openModal", row);
}

defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IPhoneNumber[]> },
});

</script>
<template>
  <div class="relative overflow-x-auto overflow-y-auto rounded-xl mt-5">
    <table id="theTable" class="w-full border-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center">
        <tr>
          <th scope="col" class="exclude-row border-2"
            v-if="user.dataDelivery === 'WRITE' || (user.role === 'ADMIN')">
            изменение
          </th>
          <th scope="col" class="border-2">
            Телефон
          </th>
          <th scope="col" class="border-2">
            Адрес
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" class="text-center">
          <td class="border-2">
            <h1 @click="openModal(row)" class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              v-if="(user.role === 'ADMIN')">
              ✏️
            </h1>
          </td>
          <th scope="row" class="border-2">
            {{ row.number }}
          </th>
          <th scope="row" class="border-2">
            {{ row.address }}
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