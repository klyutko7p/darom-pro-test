<!-- File: components/WorklogTable.vue -->

<script lang="ts" setup>
import { defineProps } from "vue";
interface Props {
  worklogs: any[];
  daysInMonth: number[];
  user: any;
  isVisibleInputs: boolean;
  dropdownStates: Record<number, boolean>;
  totalHours: (data: Record<string, number>) => number;
  workedDays: (data: Record<string, number>) => number;
  isShowModal?: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits([
  "deleteWorklog",
  "updateWorklog",
  "checkTasks",
  "toggleDropdown",
]);

function onDeleteWorklog(id: number) {
  emit("deleteWorklog", id);
}

function updateWorklog(id: number, day: number, hours: any) {
  emit("updateWorklog", { id, day, hours });
}

function checkTasks(worklog: WorkLog, day: number) {
  emit("checkTasks", { worklog, day });
}

function toggleDropdown(id: number) {
  emit("toggleDropdown", id);
}

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

const checkedRows = ref<number[]>([]);

const handleCheckboxChange = (row: any): void => {
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
  } else {
    checkedRows.value.push(row.id);
  }
};

// Чтобы передавать данные по кликам, например, для формирования dropdown‑элементов:
const getItems = (row: any) => [
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => {
        onDeleteWorklog(row.id);
      },
    },
  ],
];
</script>

<template>
  <div
    :class="{
      'relative overflow-x-auto w-full mx-auto text-center bg-white max-h-[100px]':
        isShowModal,
      'relative overflow-x-auto max-h-[600px] mt-5 w-full pb-1 mx-auto text-center bg-white': true,
    }"
    v-if="worklogs.length"
  >
    <table
      id="theTable"
      class="w-full shadow text-black text-sm mt-5 border-collapse border border-gray-300"
    >
      <thead class="bg-white border sticky top-0 z-30 uppercase text-center">
        <tr>
          <th
            v-if="user.role !== 'pvzEmployer'"
            class="border border-gray-300 p-2"
          >
            Выд.
          </th>
          <th class="border border-gray-300 p-2">ПВЗ</th>
          <th class="border border-gray-300 p-2">Компания</th>
          <th class="border border-gray-300 p-2">Сотрудник</th>
          <th
            v-for="day in daysInMonth"
            :key="day"
            class="border border-gray-300 p-2"
          >
            {{ day }}
          </th>
          <th class="border border-gray-300 p-2">Часы</th>
          <th class="border border-gray-300 p-2">Дни</th>
          <th v-if="user.role === 'ADMIN'" class="border border-gray-300 p-2">
            Действия
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="worklog in worklogs"
          :key="worklog.id"
          :class="{ 'bg-orange-100': isChecked(worklog.id) }"
        >
          <td
            v-if="user.role !== 'pvzEmployer'"
            class="border-2 text-secondary-color"
          >
            <input
              type="checkbox"
              :value="worklog.id"
              :checked="isChecked(worklog.id)"
              @change="handleCheckboxChange(worklog)"
            />
          </td>
          <td class="border border-gray-300 py-2 px-5">{{ worklog.pvz }}</td>
          <td class="border border-gray-300">{{ worklog.company }}</td>
          <td class="border border-gray-300 py-2 px-5 whitespace-nowrap">
            {{ worklog.user.name }}
          </td>
          <td
            v-for="(day, index) in daysInMonth"
            :key="index"
            class="border border-gray-300 p-2"
          >
            <div class="flex items-center justify-center gap-1">
              <UInput
                v-if="isVisibleInputs"
                class="w-[65px] mx-1 text-center bg-gray-100"
                type="number"
                v-model="worklog.data[day]"
                @blur="updateWorklog(worklog.id, day, worklog.data[day])"
              />
              <h1 v-else>{{ worklog.data[day] }}</h1>
              <div
                v-if="isVisibleInputs"
                @click="checkTasks(worklog, day)"
                class="font-semibold duration-200 cursor-pointer hover:opacity-50"
              >
                📑
              </div>
            </div>
          </td>
          <td class="border border-gray-300 p-2 text-center">
            {{ totalHours(worklog.data) }}
          </td>
          <td class="border border-gray-300 p-2 text-center">
            {{ workedDays(worklog.data) }}
          </td>
          <td
            v-if="user.role === 'ADMIN'"
            class="border border-gray-300 p-2 text-center max-w-[10px]"
          >
            <UDropdown
              :open="dropdownStates[worklog.id]"
              :items="getItems(worklog)"
            >
              <UButton
                variant="ghost"
                color="gray"
                class="text-sm duration-200"
                @touchstart.stop="toggleDropdown(worklog.id)"
              >
                ...
              </UButton>
            </UDropdown>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="text-center mt-24 text-2xl font-semibold bg-gray-100 py-24" v-else>
    <h1>Табель за этот месяц ещё не создан.</h1>
  </div>
</template>
