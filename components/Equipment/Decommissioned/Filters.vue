<script setup lang="ts">
const props = defineProps({
  rows: {
    type: Array as PropType<IDecommissionedEquipmentRow[]>,
    required: true,
  },
  user: { type: Object as PropType<User>, required: true },
});
import VueMultiselect from "vue-multiselect";
import { vAutoAnimate } from "@formkit/auto-animate";
import {
  formatRelative,
  subDays,
  sub,
  format,
  isSameDay,
  type Duration,
} from "date-fns";
import ru from "date-fns/locale/ru";

const ranges = [
  { label: "Текущий месяц", duration: { month: "current" } },
  { label: "Сегодня", duration: { days: 0 } },
  { label: "Последние 7 дней", duration: { days: 7 } },
  { label: "Последние 14 дней", duration: { days: 14 } },
  { label: "Последние 30 дней", duration: { days: 30 } },
  { label: "Последние 3 месяца", duration: { months: 3 } },
  { label: "Последние 6 месяцев", duration: { months: 6 } },
  { label: "Последний год", duration: { years: 1 } },
];

const selected = ref({
  start: new Date(2024, 0, 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
});

function isRangeSelected(duration: Duration) {
  if (duration.month === "current") {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );
    return (
      isSameDay(selected.value.start, startOfMonth) &&
      isSameDay(selected.value.end, endOfMonth)
    );
  }
  return (
    isSameDay(selected.value.start, sub(new Date(), duration)) &&
    isSameDay(selected.value.end, new Date())
  );
}

function selectRange(duration: Duration) {
  if (duration.month === "current") {
    selected.value = {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    };
  } else {
    selected.value = { start: sub(new Date(), duration), end: new Date() };
  }
}

const storeEquipments = useEquipmentsStore();
let showFilters = ref(false);

const selectedPVZ = ref<Array<string>>([]);
const selectedNameOfEquipment = ref<Array<string>>([]);
const selectedReason = ref<Array<string>>([]);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);

const uniquePVZ = computed(() => {
  let array = storeEquipments.getUniqueNonEmptyValues(
    rowsEquipments.value.filter(
      (row) =>
        row.deleted !== null &&
        props.rows.some((rowData) => rowData.equipmentRowId === row.id)
    ),
    "pvz"
  );
  array = array.map((pvz) => pvz.name);
  array = [...new Set(array)];
  return array;
});

const uniqueNameOfEquipment = computed(() => {
  return storeEquipments.getUniqueNonEmptyValues(
    rowsEquipments.value.filter(
      (row) =>
        row.deleted !== null &&
        props.rows.some((rowData) => rowData.equipmentRowId === row.id)
    ),
    "nameOfEquipment"
  );
});

const uniqueReason = computed(() => {
  return storeEquipments.getUniqueNonEmptyValuesDecommissioned(
    props.rows.filter((row) => row.deleted === null),
    "reason"
  );
});

const filteredRows = ref<Array<IDecommissionedEquipmentRow>>();

const emit = defineEmits(["filtered-rows"]);

const filterRows = () => {
  let newStartingDate = new Date(selected.value.start);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(selected.value.end);
  newEndDate.setHours(23);
  newEndDate.setMinutes(59);
  newEndDate.setSeconds(59);
  newEndDate.setMilliseconds(0);

  filteredRows.value = props.rows.slice();
  filteredRows.value = props.rows.filter((row) => {
    return (
      (!selectedPVZ.value.length ||
        selectedPVZ.value.includes(row.equipmentRow.pvz.name)) &&
      (!selectedNameOfEquipment.value.length ||
        selectedNameOfEquipment.value.includes(
          row.equipmentRow.nameOfEquipment
        )) &&
      (!selectedReason.value.length ||
        selectedReason.value.includes(row.reason)) &&
      (!selected.value.start ||
        new Date(row.decommissionDate) >= new Date(newStartingDate)) &&
      (!selected.value.end ||
        new Date(row.decommissionDate) <= new Date(newEndDate))
    );
  });
  emit("filtered-rows", filteredRows.value);
};

function clearFields() {
  selectedPVZ.value = [];
  selectedNameOfEquipment.value = [];
  selectedReason.value = [];
  startingDate.value = "";
  endDate.value = "";
  selected.value.start = new Date(
    2024,
    new Date().getMonth(),
    1
  );
  selected.value.end = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  );
  filterRows();
}

watch(
  [
    selectedPVZ,
    startingDate,
    selectedNameOfEquipment,
    selectedReason,
    endDate,
    selected,
  ],
  filterRows
);

const selectedArrays = [selectedPVZ, selectedNameOfEquipment, selectedReason];

const rowsEquipments = ref<Array<IEquipmentRow>>([]);
onMounted(async () => {
  filterRows();
  rowsEquipments.value = await storeEquipments.getEquipments();
});

const nonEmptyCount = computed(() => {
  let count = 0;
  selectedArrays.forEach((selectedArray) => {
    selectedArray.value.forEach((element) => {
      if (element !== undefined && element !== null && element !== "") {
        count++;
      }
    });
  });

  if (startingDate.value) {
    count++;
  } else if (endDate.value) {
    count++;
  }

  return count;
});
</script>

<template>
  <div v-auto-animate>
    <div class="flex items-center gap-3 max-xl:mt-0">
      <UButton
        color="orange"
        variant="solid"
        class="font-semibold duration-200"
        icon="material-symbols:filter-list-rounded"
        @click="showFilters = !showFilters"
      >
        Фильтры – {{ nonEmptyCount }}
      </UButton>
    </div>
    <div
      v-if="showFilters"
      class="bg-white max-sm:px-3 max-sm:py-1 py-3 px-10 shadow-lg mt-3 mb-5"
    >
      <div
        class="grid grid-cols-2 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-x-5"
      >
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Показать для ПВЗ</h1>
          <VueMultiselect
            v-model="selectedPVZ"
            :options="uniquePVZ"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Название</h1>
          <VueMultiselect
            v-model="selectedNameOfEquipment"
            :options="uniqueNameOfEquipment"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите название"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Причина</h1>
          <VueMultiselect
            v-model="selectedReason"
            :options="uniqueReason"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите причину"
          />
        </div>
      </div>
      <div class="flex items-start space-y-2 flex-col mt-5 text-center">
        <h1>Дата списания</h1>
        <UPopover
          :popper="{ placement: 'auto' }"
          class="block max-sm:hidden my-5 max-w-[220px]"
        >
          <UButton
            type="button"
            icon="i-heroicons-calendar-days-20-solid"
            color="orange"
          >
            {{ format(selected.start, "dd MMM yyy", { locale: ru }) }} —
            {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
          </UButton>

          <template #panel="{ close }">
            <div
              class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800"
            >
              <div class="hidden sm:flex flex-col py-4">
                <UButton
                  v-for="(range, index) in ranges"
                  :key="index"
                  :label="range.label"
                  color="white"
                  variant="ghost"
                  class="rounded-none px-6"
                  :class="[
                    isRangeSelected(range.duration)
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  ]"
                  truncate
                  @click="selectRange(range.duration)"
                />
              </div>

              <DatePicker v-model="selected" @close="close" />
            </div>
          </template>
        </UPopover>
        <UPopover
          :overlay="true"
          :popper="{ placement: 'auto' }"
          class="hidden max-sm:block mx-auto max-w-[220px] my-5"
        >
          <UButton
            type="button"
            icon="i-heroicons-calendar-days-20-solid"
            color="orange"
          >
            {{ format(selected.start, "dd MMM yyy", { locale: ru }) }} —
            {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
          </UButton>

          <template #panel="{ close }">
            <div
              class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800"
            >
              <div class="hidden sm:flex flex-col py-4">
                <UButton
                  v-for="(range, index) in ranges"
                  :key="index"
                  :label="range.label"
                  color="white"
                  variant="ghost"
                  class="rounded-none px-6"
                  :class="[
                    isRangeSelected(range.duration)
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  ]"
                  truncate
                  @click="selectRange(range.duration)"
                />
              </div>

              <DatePickerSingleMonth v-model="selected" @close="close" />
            </div>
          </template>
        </UPopover>
      </div>

      <div class="flex justify-end gap-3 mt-3 mb-5">
        <UIMainButton @click="filterRows(), (showFilters = !showFilters)"
          >Принять</UIMainButton
        >
        <UIActionButton @click="clearFields">Очистить фильтры</UIActionButton>
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
