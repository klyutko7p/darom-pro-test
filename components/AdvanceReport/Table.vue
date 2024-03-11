<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "updateDeliveryRow"]);

function updateDeliveryRow(row: IAdvanceReport) {
  emit("updateDeliveryRow", { row: row });
}

function openModal(row: IAdvanceReport) {
  emit("openModal", row);
}

defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
});
</script>
<template>
  <div class="relative max-h-[410px] overflow-y-auto mt-5 mb-10">
    <table
      id="theTable"
      class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
      >
        <tr>
          <th
            scope="col"
            class="exclude-row border-2"
            v-if="
              user.dataDelivery === 'WRITE' ||
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR'
            "
          >
            изменение
          </th>
          <th scope="col" class="border-2">ПВЗ</th>
          <th scope="col" class="border-2">Дата</th>
          <th scope="col" class="border-2">Выдано</th>
          <th scope="col" class="border-2">Расход</th>
          <th scope="col" class="border-2">Статья расхода</th>
          <th scope="col" class="border-2">Комментарий</th>
          <th scope="col" class="border-2">Компания</th>
          <th scope="col" class="border-2">Получено</th>
          <th scope="col" class="border-2">Подтверждающий документ</th>
          <th scope="col" class="border-2">От кого</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" class="text-center">
          <td class="border-2">
            <h1
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
            >
              ✏️
            </h1>
          </td>
          <th scope="row" class="border-2">
            {{ row.PVZ }}
          </th>
          <th scope="row" class="border-2">
            {{ storeUsers.getNormalizedDate(row.date) }}
          </th>
          <td class="border-2 whitespace-nowrap">
            {{ row.issuedUser }}
          </td>
          <td class="border-2 whitespace-nowrap">{{ row.expenditure }} ₽</td>
          <td class="border-2 whitespace-nowrap">
            {{ row.typeOfExpenditure }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.notation }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.company }}
          </td>
          <td class="border-2 whitespace-nowrap">
            <Icon
              @click="updateDeliveryRow(row)"
              v-if="user.username === row.issuedUser && !row.received"
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1 class="font-bold text-green-500">
              {{
                row.received ? storeUsers.getNormalizedDate(row.received) : ""
              }}
            </h1>
          </td>
          <td class="border-2 whitespace-nowrap">
            {{
              row.supportingDocuments.length > 0 ? row.supportingDocuments : ""
            }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.createdUser }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
