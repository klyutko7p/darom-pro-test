<script setup lang="ts">
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "updateDeliveryRow"]);

function updateDeliveryRow(row: IBalance, flag: string) {
  emit("updateDeliveryRow", { row: row, flag: flag });
}

function openModal(row: IBalance) {
  emit("openModal", row);
}

const props = defineProps({
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
          <th scope="col" class="border-[1px]">ПВЗ</th>
          <th scope="col" class="border-[1px]">Сумма</th>
          <th scope="col" class="border-[1px]">Выдано</th>
          <th scope="col" class="border-[1px]">Получено</th>
          <th scope="col" class="border-[1px]">Кем выдано</th>
          <th scope="col" class="border-[1px]">Кому выдать</th>
          <th scope="col" class="border-[1px]">Примечание</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" class="text-center">
          <th scope="row" class="border-[1px]">
            {{ row.pvz }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.sum }}
          </th>
          <td class="border-[1px] whitespace-nowrap">
            <Icon
              @click="updateDeliveryRow(row, 'issued')"
              v-if="
                !row.issued &&
                (user.PVZ.includes(row.recipient) ||
                  user.role === 'ADMINISTRATOR' ||
                  user.role === 'RMANAGER' || user.role === 'ADMIN')
              "
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1
              class="font-bold"
              :class="{ 'text-gray-400': !row.issued, 'text-green-500': row.issued }"
            >
              {{
                row.issued
                  ? storeUsers.getNormalizedDate(row.issued)
                  : "Учитывается в балансе"
              }}
            </h1>
          </td>
          <td class="border-[1px] whitespace-nowrap">
            <Icon
              @click="updateDeliveryRow(row, 'received')"
              v-if="
                !row.received &&
                row.issued &&
                (user.role === 'PVZ' || user.role === 'COURIER' || user.role === 'PPVZ')
              "
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1 class="font-bold text-green-500">
              {{ row.received ? storeUsers.getNormalizedDate(row.received) : "" }}
            </h1>
          </td>
          <th scope="row" class="border-[1px]">
            {{ row.receivedUser }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.recipient }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.notation }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>
