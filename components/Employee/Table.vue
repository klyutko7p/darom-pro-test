<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "deleteRow"]);

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function openModal(row: IEmployee) {
  emit("openModal", row);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IEmployee[]> },
});

onBeforeMount(() => {
  updateCurrentPageData();
});

const totalRows = computed(() => Math.ceil(props.rows?.length));
let returnRows = ref<Array<IEmployee>>();

function updateCurrentPageData() {
  returnRows.value = props.rows;
}



watch([props.rows, totalRows, props.user], updateCurrentPageData);
</script>
<template>
  <div class="relative max-h-[700px] overflow-y-auto mt-5 mb-10">
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
          <th scope="col" class="border-2">Компания</th>
          <th scope="col" class="border-2">ФИО</th>
          <th scope="col" class="border-2">Телефон/Карта</th>
          <th scope="col" class="border-2">Банк</th>
          <th scope="col" class="border-2">Оплата в смену</th>
          <th scope="col" class="border-2">часов в смене</th>
          <th scope="col" class="border-2">оплата в час</th>
          <th scope="col" class="border-2">удаление</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in returnRows" class="text-center">
          <td class="border-2" v-if="user.role === 'ADMIN'">
            <h1
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
            >
              ✏️
            </h1>
          </td>
          <th scope="row" class="border-2">
            {{ row.PVZ }}
          </th>
          <th scope="row" class="border-2">
            {{ row.company }}
          </th>
          <td class="border-2 whitespace-nowrap">{{ row.fullname }} </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.phone }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.bank }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.paymentPerShift }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.hoursPerShift }}
          </td>
          <td class="border-2 whitespace-nowrap" v-if="row.paymentPerShift !== null && row.hoursPerShift !== null">
            {{ (row.paymentPerShift / row.hoursPerShift).toFixed(2) }}
          </td>
          <td class="border-2 whitespace-nowrap" v-if="row.paymentPerShift === null && row.hoursPerShift === null">
            {{ 0 }}
          </td>
          <td
            class="px-6 py-4 border-2"
            v-if="
              (user.dataOurRansom === 'WRITE' && user.role === 'ADMIN') ||
              user.role === 'ADMINISTRATOR'
            "
          >
            <Icon
              @click="deleteRow(row.id)"
              class="text-red-600 cursor-pointer hover:text-red-300 duration-200"
              name="material-symbols:playlist-remove-rounded"
              size="32"
            />
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
