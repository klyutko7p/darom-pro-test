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

onBeforeMount(() => {
  updateCurrentPageData();
});

let returnRows = ref<Array<Task>>();

function updateCurrentPageData() {
  returnRows.value = props.rows;
}

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
              user.username === 'Директор'
            "
          >
            изменение
          </th>
          <th scope="col" class="border-2">Задача</th>
          <th scope="col" class="border-2">Комментарий</th>
          <th scope="col" class="border-2">Выполнено</th>
          <th scope="col" class="border-2">Проверено</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in returnRows" class="text-center">
          <td class="border-2" v-if="user.username === 'Директор'">
            <h1
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
            >
              ✏️
            </h1>
          </td>
          <th scope="row" class="border-2">
            {{ row.description }}
          </th>
          <th scope="row" class="border-2">
            {{ row.notation }}
          </th>
          <td class="border-2 whitespace-nowrap">
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
          <td class="border-2 whitespace-nowrap">
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
</style>
