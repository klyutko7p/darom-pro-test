<script setup lang="ts">
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "updateDeliveryRow"]);

function updateDeliveryRow(row: IBalance, flag: string) {
  emit("updateDeliveryRow", { row: row, flag: flag });
}

function openModal(row: IBalance) {
  emit("openModal", row);
}

defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IBalance[]> },
});

onMounted(() => {});
</script>
<template>
  <div class="relative max-h-[265px] overflow-y-auto mt-5 mb-10">
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
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR'
            "
          >
            изменение
          </th>
          <th scope="col" class="border-2">ПВЗ</th>
          <th scope="col" class="border-2">Сумма</th>
          <th scope="col" class="border-2">Выдано</th>
          <th scope="col" class="border-2">Получено</th>
          <th scope="col" class="border-2">Кем выдано</th>
          <th scope="col" class="border-2">Кому выдать</th>
          <th
            scope="col"
            class="border-2"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
          >
            Кем получено
          </th>
          <th scope="col" class="border-2">Примечание</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" class="text-center">
          <td
            class="border-2"
            v-if="user.role !== 'PVZ' && user.role !== 'COURIER'"
          >
            <h1
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
            >
              ✏️
            </h1>
          </td>
          <th scope="row" class="border-2">
            {{ row.pvz }}
          </th>
          <th scope="row" class="border-2">
            {{ row.sum }}
          </th>
          <td class="border-2 whitespace-nowrap">
            <Icon
              @click="updateDeliveryRow(row, 'issued')"
              v-if="
                !row.issued && (user.role === 'PVZ' || user.role === 'COURIER')
              "
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1 class="font-bold text-green-500" :class="{'text-gray-300': !row.issued}">
              {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "Учитывается в балансе" }}
            </h1>
          </td>
          <td class="border-2 whitespace-nowrap">
            <Icon
              @click="updateDeliveryRow(row, 'received')"
              v-if="
                !row.received &&
                (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR') &&
                row.issued &&
                row.recipient === 'Нет'
              "
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <Icon
              @click="updateDeliveryRow(row, 'received')"
              v-if="
                !row.received &&
                row.issued &&
                (user.PVZ.includes(row.recipient) || user.role === 'ADMINISTRATOR')
              "
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
          <th scope="row" class="border-2">
            {{ row.receivedUser }}
          </th>
          <th scope="row" class="border-2">
            {{ row.recipient }}
          </th>
          <th
            scope="row"
            class="border-2"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
          >
            {{ row.receivedUser2 }}
          </th>
          <th scope="row" class="border-2">
            {{ row.notation }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>