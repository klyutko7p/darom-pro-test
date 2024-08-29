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

onMounted(() => {
  updateCurrentPageData();
});

const totalRows = computed(() => Math.ceil(props.rows?.length));
let returnRows = ref<Array<IEmployee>>();

function updateCurrentPageData() {
  returnRows.value = props.rows?.sort((a, b) => {
    return a.fullname.localeCompare(b.fullname, "ru");
  });
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);
</script>
<template>
  <div class="relative overflow-x-auto overflow-y-auto mt-5 mb-5">
    <table
      id="theTable"
      class="w-full bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
      >
        <tr>
          <th
            scope="col"
            class="exclude-row h-[40px] border-[1px]"
            v-if="
              user.dataDelivery === 'WRITE' ||
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'RMANAGER'
            "
          >
            изменение
          </th>
          <th scope="col" class="border-[1px]">ПВЗ</th>
          <th scope="col" class="border-[1px]">Компания</th>
          <th scope="col" class="border-[1px]">ФИО</th>
          <th scope="col" class="border-[1px]">Телефон/Карта</th>
          <th scope="col" class="border-[1px]">Банк</th>
          <th scope="col" class="border-[1px]">Оплата в смену</th>
          <th scope="col" class="border-[1px]">часов в смене</th>
          <th scope="col" class="border-[1px]">оплата в час</th>
          <th scope="col" class="border-[1px]">удаление</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in returnRows" class="text-center">
          <td class="border-[1px]">
            <div
              @click="openModal(row)"
              class="bg-green-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
              <Icon class="text-green-500" name="ic:baseline-mode-edit" size="18" />
            </div>
          </td>
          <th scope="row" class="border-[1px]">
            {{ row.PVZ }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.company }}
          </th>
          <td class="border-[1px] whitespace-nowrap">{{ row.fullname }}</td>
          <td class="border-[1px] whitespace-nowrap">
            {{ row.phone }}
          </td>
          <td class="border-[1px] whitespace-nowrap">
            {{ row.bank }}
          </td>
          <td class="border-[1px] whitespace-nowrap">
            {{ row.paymentPerShift }}
          </td>
          <td class="border-[1px] whitespace-nowrap">
            {{ row.hoursPerShift }}
          </td>
          <td
            class="border-[1px] whitespace-nowrap"
            v-if="row.paymentPerShift !== null && row.hoursPerShift !== null"
          >
            {{ (row.paymentPerShift / row.hoursPerShift).toFixed(2) }}
          </td>
          <td
            class="border-[1px] whitespace-nowrap"
            v-if="row.paymentPerShift === null && row.hoursPerShift === null"
          >
            {{ 0 }}
          </td>
          <td
            class="px-4 py-2 border-[1px]"
            v-if="
              (user.dataOurRansom === 'WRITE' && user.role === 'ADMIN') ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'RMANAGER'
            "
          >
            <div
              @click="deleteRow(row.id)"
              class="bg-red-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
              <Icon class="text-red-600" name="ic:round-delete" size="18" />
            </div>
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

tr:nth-child(even) {
  background-color: #f2f2f2; /* Цвет для четных строк */
}
</style>
