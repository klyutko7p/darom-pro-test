<script setup lang="ts">
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "deleteRow", "updateDeliveryRow"]);

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

function deleteRow(id: number) {
  emit("deleteRow", id);
}

onMounted(() => {});
</script>
<template>
  <div class="relative max-h-[265px] overflow-y-auto mt-5 mb-10">
    <table
      id="theTable"
      class="w-full border-[1px] border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center"
      >
        <tr>
          <th
            scope="col"
            class="exclude-row border-[1px] h-[40px] px-3"
            v-if="
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'RMANAGER'
            "
          >
            изменение
          </th>
          <th scope="col" class="border-[1px]">ПВЗ</th>
          <th scope="col" class="border-[1px]">Сумма</th>
          <th scope="col" class="border-[1px]">Выдано</th>
          <th scope="col" class="border-[1px]">Получено</th>
          <th scope="col" class="border-[1px]">Кем выдано</th>
          <th scope="col" class="border-[1px]">Кому выдать</th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
          >
            Кем получено
          </th>
          <th scope="col" class="border-[1px]">Примечание</th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
          >
            Дата создания
          </th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="
              user.username === 'Власенкова' || user.username === 'Директор'
            "
          >
            Удаление
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows?.sort((a, b) => {
            if (a.issued === null && b.issued !== null) {
              return -1;
            } else if (a.issued !== null && b.issued === null) {
              return 1;
            } else {
              return new Date(b.issued) - new Date(a.issued);
            }
          })"
          class="text-center"
        >
          <td
            class="border-[1px]"
            v-if="
              user.role !== 'PVZ' &&
              user.username !== 'Рейзвих' &&
              user.role !== 'PPVZ'
            "
          >
            <h1
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              ✏️
            </h1>
          </td>
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
                (!row.issued &&
                  (user.role === 'PVZ' ||
                    user.username === 'Рейзвих' ||
                    user.role === 'PPVZ')) ||
                (row.notation === 'Вывод дохода' &&
                  (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR') &&
                  !row.issued)
              "
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1
              class="font-bold"
              :class="{
                'text-gray-400': !row.issued,
                'text-green-500': row.issued,
              }"
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
                (user.role === 'ADMIN' ||
                  user.role === 'ADMINISTRATOR' ||
                  user.PVZ.includes(row.recipient)) &&
                row.issued
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
          <th scope="row" class="border-[1px]">
            {{ row.receivedUser }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.recipient }}
          </th>
          <th
            scope="row"
            class="border-[1px]"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
          >
            {{ row.receivedUser2 }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.notation }}
          </th>
          <th
            scope="row"
            class="border-[1px]"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
          >
            {{ storeUsers.getNormalizedDate(row.created_at) }}
          </th>
          <th
            class="border-[1px]"
            v-if="
              user.username === 'Власенкова' || user.username === 'Директор'
            "
          >
            <div
              @click="deleteRow(row.id)"
              class="bg-red-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
              <Icon class="text-red-600" name="ic:round-delete" size="18" />
            </div>
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
