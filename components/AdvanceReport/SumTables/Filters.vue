<script setup lang="ts">
import VueMultiselect from "vue-multiselect";
import { vAutoAnimate } from "@formkit/auto-animate";
import { sub, format, isSameDay, type Duration } from "date-fns";
import type { PropType } from "vue";
import ru from "date-fns/locale/ru";

const emit = defineEmits(["filtered-rows"]);

interface DurationType {
  month?: "current" | "0" | "1" | string;
  years?: number;
}

interface SelectedDateRange {
  start: Date;
  end: Date;
}

const props = defineProps({
  rows: { type: Array as PropType<IAdvanceReport[]>, required: true },
});

const storeAdvanceReports = useAdvanceReports();

const filteredRows = ref<Array<IAdvanceReport>>();

const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);

const selectedTypeOfExpenditure = ref<Array<string>>([]);
const selectedType = ref<Array<string>>(["Нал"]);

const uniqueTypeOfExpenditure = computed(() => {
  let array = storeAdvanceReports.getUniqueNonEmptyValues(
    props.rows,
    "typeOfExpenditure"
  );
  let newArray = array.map((string) => {
    if (string === "Расходники для ПВ��") {
      return "Расходники для ПВЗ";
    }
    return string;
  });
  newArray = new Set(newArray);
  return Array.from(newArray);
});

const uniqueType = ref(["Нал"]);

function clearFields() {
  selectedTypeOfExpenditure.value = [];
  selectedType.value = ["Нал"];
  startingDate.value = "";
  endDate.value = "";
  selected.value.start = new Date(2024, 0, 1);
  selected.value.end = new Date();
  filterRows();
}

function setDateToStartOfDay(date: Date) {
  date.setHours(0, 0, 1, 0);
  return date;
}

const filterRows = async () => {
  filteredRows.value = props.rows?.slice();
  filteredRows.value = props.rows?.filter((row) => {
    const includeDeductions =
      selectedTypeOfExpenditure.value.includes("Оплата ФОТ") &&
      row.typeOfExpenditure === "Удержания с сотрудников";

    return (
      (!selectedTypeOfExpenditure.value.length ||
        selectedTypeOfExpenditure.value.includes(row.typeOfExpenditure) ||
        includeDeductions) &&
      (!selectedType.value.length || selectedType.value.includes(row.type)) &&
      (!selected.value.start ||
        setDateToStartOfDay(new Date(row.date)) >=
          setDateToStartOfDay(new Date(selected.value.start))) &&
      (!selected.value.end ||
        setDateToStartOfDay(new Date(row.date)) <=
          setDateToStartOfDay(new Date(selected.value.end)))
    );
  });

  emit("filtered-rows", [
    filteredRows.value,
    selected.value,
    selectedType.value,
    selectedTypeOfExpenditure.value,
  ]);
  showFilters.value = false;
};

const ranges = [
  { label: "Январь", duration: { month: "0" } },
  { label: "Февраль", duration: { month: "1" } },
  { label: "Март", duration: { month: "2" } },
  { label: "Апрель", duration: { month: "3" } },
  { label: "Май", duration: { month: "4" } },
  { label: "Июнь", duration: { month: "5" } },
  { label: "Июль", duration: { month: "6" } },
  { label: "Август", duration: { month: "7" } },
  { label: "Сентябрь", duration: { month: "8" } },
  { label: "Октябрь", duration: { month: "9" } },
  { label: "Ноябрь", duration: { month: "10" } },
  { label: "Декабрь", duration: { month: "11" } },
  { label: "Текущий месяц", duration: { month: "current" } },
  { label: "Последний год", duration: { years: 1 } },
];

const selected = ref<SelectedDateRange>({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
});

function getMonthRange(year: number, month: number): SelectedDateRange {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

function isRangeSelected(duration: DurationType): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  if (duration.month === "current") {
    const { start, end } = getMonthRange(currentYear, currentDate.getMonth());
    return (
      isSameDay(selected.value.start, start) &&
      isSameDay(selected.value.end, end)
    );
  }

  const month = parseInt(duration.month as string, 10);
  if (!isNaN(month) && month >= 0 && month <= 11) {
    const { start, end } = getMonthRange(currentYear, month);
    return (
      isSameDay(selected.value.start, start) &&
      isSameDay(selected.value.end, end)
    );
  }

  if (duration.years) {
    const start = sub(currentDate, { years: duration.years });
    return (
      isSameDay(selected.value.start, start) &&
      isSameDay(selected.value.end, currentDate)
    );
  }

  return false;
}

function selectRange(duration: DurationType) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  if (duration.month === "current") {
    selected.value = getMonthRange(currentYear, currentDate.getMonth());
    return;
  }

  const month = parseInt(duration.month as string, 10);
  if (!isNaN(month) && month >= 0 && month <= 11) {
    selected.value = getMonthRange(currentYear, month);
    return;
  }

  if (duration.years) {
    selected.value = {
      start: sub(currentDate, { years: duration.years }),
      end: currentDate,
    };
    return;
  }
}

let showFilters = ref(false);
</script>
<template>
  <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
    <h1 class="text-xl font-bold">Фильтры</h1>
    <Icon
      @click="showFilters = !showFilters"
      class="cursor-pointer duration-200 hover:text-secondary-color"
      name="material-symbols:settings-rounded"
      size="24"
    />
  </div>

  <div
    v-if="showFilters"
    class="border-2 bg-white border-secondary-color border-dashed py-10 px-10 max-sm:px-5 shadow-2xl mt-3"
  >
    <div
      class="duration-200 flex items-center justify-between max-lg:flex-col max-lg:space-y-5 max-lg:items-start"
    >
      <div class="w-full">
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Статья расхода</h1>
          <VueMultiselect
            v-model="selectedTypeOfExpenditure"
            :options="uniqueTypeOfExpenditure"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите статью расхода"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Тип</h1>
          <VueMultiselect
            v-model="selectedType"
            :options="uniqueType"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите тип"
          />
        </div>
      </div>
    </div>

    <div v-auto-animate class="my-10 flex items-center justify-center gap-5">
      <UPopover class="block max-sm:hidden" :popper="{ placement: 'bottom' }">
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
            class="flex items-center flex-col sm:divide-x divide-gray-200 dark:divide-gray-800"
          >
            <DatePickerSingleMonth v-model="selected" @close="close" />

            <div class="grid grid-cols-2">
              <UButton
                v-for="(range, index) in ranges"
                :key="index"
                :label="range.label"
                color="white"
                variant="ghost"
                class="rounded-none px-2"
                :class="[
                  isRangeSelected(range.duration)
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                ]"
                truncate
                @click="selectRange(range.duration)"
              />
            </div>
          </div>
        </template>
      </UPopover>

      <UPopover
        class="hidden max-sm:block"
        :overlay="true"
        :popper="{ placement: 'bottom' }"
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
            class="flex items-center flex-col sm:divide-x divide-gray-200 dark:divide-gray-800"
          >
            <DatePickerSingleMonth v-model="selected" @close="close" />

            <div class="grid grid-cols-2 px-2 py-2">
              <UButton
                v-for="(range, index) in ranges"
                :key="index"
                :label="range.label"
                color="white"
                variant="ghost"
                class="rounded-none"
                :class="[
                  isRangeSelected(range.duration)
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                ]"
                truncate
                @click="selectRange(range.duration)"
              />
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <div class="flex justify-end gap-3 mt-3">
      <UIMainButton @click="filterRows()">Принять</UIMainButton>
      <UIActionButton @click="clearFields">Очистить фильтры</UIActionButton>
    </div>
  </div>
</template>

<style scoped></style>
