<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "updateStatus"]);

function openModal(row: Task) {
  emit("openModal", row);
}

function updateStatus(row: Task, flag: string) {
  emit("updateStatus", { row, flag });
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<Task[]> },
});

onMounted(() => {
  updateCurrentPageData();
});

let returnRows = ref<Array<Task>>();

function updateCurrentPageData() {
  returnRows.value = props.rows;
}

</script>
<template>
  <div class="relative overflow-x-auto overflow-y-auto mt-5 mb-5">
    <table id="theTable"
      class="w-full bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
      >
        <tr>
          <th
            scope="col"
            class="exclude-row border-[1px] h-[30px] px-3"
            v-if="
              user.username === 'Директор'
            "
          >
            изменение
          </th>
          <th scope="col" class="border-[1px]">Задача</th>
          <th scope="col" class="border-[1px]">Комментарий</th>
          <th scope="col" class="border-[1px]">Выполнено</th>
          <th scope="col" class="border-[1px]">Проверено</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in returnRows" class="text-center">
          <td class="border-[1px]">
            <div
              @click="openModal(row)"
              class="bg-green-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1  mx-auto"
            >
              <Icon
                class="text-green-500"
                name="ic:baseline-mode-edit"
                size="18"
              />
            </div>
          </td>
          <th scope="row" class="border-[1px]">
            {{ row.description }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.notation }}
          </th>
          <td class="border-[1px] whitespace-nowrap">
            <Icon
              @click="updateStatus(row, 'DONE')"
              v-if="!row.done"
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1 class="font-bold text-green-500">
              {{ row.done ? storeUsers.getNormalizedDate(row.done) : "" }}
            </h1>
          </td>
          <td class="border-[1px] whitespace-nowrap">
            <Icon
              @click="updateStatus(row, 'CHECKED')"
              v-if="!row.checked"
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1 class="font-bold text-green-500">
              {{ row.checked ? storeUsers.getNormalizedDate(row.checked) : "" }}
            </h1>
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
