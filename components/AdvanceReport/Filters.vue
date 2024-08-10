<script setup lang="ts">
const props = defineProps({
  rows: { type: Array as PropType<IAdvanceReport[]>, required: true },
  user: { type: Object as PropType<User>, required: true },
});
import VueMultiselect from "vue-multiselect";
import { vAutoAnimate } from "@formkit/auto-animate";

import { sub, format, isSameDay, type Duration } from 'date-fns'

const ranges = [
  { label: 'Текущий месяц', duration: { month: 'current' } },
  { label: 'Сегодня', duration: { days: 0 } },
  { label: 'Последние 7 дней', duration: { days: 7 } },
  { label: 'Последние 14 дней', duration: { days: 14 } },
  { label: 'Последние 30 дней', duration: { days: 30 } },
  { label: 'Последние 3 месяца', duration: { months: 3 } },
  { label: 'Последние 6 месяцев', duration: { months: 6 } },
  { label: 'Последний год', duration: { years: 1 } }
]

const selected = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
})

function isRangeSelected(duration: Duration) {
  if (duration.month === 'current') {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    return isSameDay(selected.value.start, startOfMonth) && isSameDay(selected.value.end, endOfMonth)
  }
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}

function selectRange(duration: Duration) {
  if (duration.month === 'current') {
    selected.value = {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }
  } else {
    selected.value = { start: sub(new Date(), duration), end: new Date() }
  }
}

const storeAdvanceReports = useAdvanceReports();

let showFilters = ref(false);

const selectedPVZ = ref<Array<string>>([]);
const selectedType = ref<Array<string>>([]);
const selectedExpenditure = ref<Array<string>>([]);
const selectedTypeOfExpenditure = ref<Array<string>>([]);
const selectedNotation = ref<Array<string>>([]);
const selectedCompany = ref<Array<string>>([]);
const selectedCreatedUser = ref<Array<string>>([]);
const selectedIssuedUser = ref<number | string | null>(null);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);
const startingDate2 = ref<Date | string | null>(null);
const endDate2 = ref<Date | string | null>(null);

const uniquePVZ = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "PVZ");
});

const uniqueExpenditure = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "expenditure");
});

const uniqueTypeOfExpenditure = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "typeOfExpenditure");
});

const uniqueNotation = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "notation");
});

const uniqueCompany = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "company");
});

const uniqueCreatedUser = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "createdUser");
});

const uniqueIssuedUser = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "issuedUser");
});

const filteredRows = ref<Array<IAdvanceReport>>();

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

  let newStartingDate2 = new Date(startingDate2.value);
  newStartingDate2.setHours(0);
  newStartingDate2.setMinutes(0);
  newStartingDate2.setSeconds(0);
  newStartingDate2.setMilliseconds(0);

  let newEndDate2 = new Date(endDate2.value);
  newEndDate2.setHours(23);
  newEndDate2.setMinutes(59);
  newEndDate2.setSeconds(59);
  newEndDate2.setMilliseconds(0);

  filteredRows.value = props.rows.slice();
  filteredRows.value = props.rows.filter((row) => {
    return (
      (!selectedPVZ.value.length || selectedPVZ.value.includes(row.PVZ)) &&
      (!selectedType.value.length || selectedType.value.includes(row.type)) &&
      (!selectedExpenditure.value.length ||
        selectedExpenditure.value.includes(row.expenditure)) &&
      (!selectedTypeOfExpenditure.value.length ||
        selectedTypeOfExpenditure.value.includes(row.typeOfExpenditure)) &&
      (!selectedNotation.value.length || selectedNotation.value.includes(row.notation)) &&
      (!selectedCompany.value.length || selectedCompany.value.includes(row.company)) &&
      (!selectedCreatedUser.value.length ||
        selectedCreatedUser.value.includes(row.createdUser)) &&
      (!selectedIssuedUser.value || row.issuedUser === selectedIssuedUser.value) &&
      (!selected.value.start || new Date(row.date) >= new Date(newStartingDate)) &&
      (!selected.value.end || new Date(row.date) <= new Date(newEndDate)) &&
      (!startingDate2.value || new Date(row.received) >= new Date(newStartingDate2)) &&
      (!endDate2.value || new Date(row.received) <= new Date(newEndDate2))
    );
  });
  emit("filtered-rows", filteredRows.value);
};

function clearFields() {
  selectedPVZ.value = [];
  selectedType.value = [];
  selectedExpenditure.value = [];
  selectedTypeOfExpenditure.value = [];
  selectedCompany.value = [];
  selectedNotation.value = [];
  selectedCreatedUser.value = [];
  selectedIssuedUser.value = "";
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  selected.value.start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  selected.value.end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  filterRows();
}

watch(
  [
    selectedPVZ,
    selectedExpenditure,
    selectedTypeOfExpenditure,
    selectedType,
    selectedCompany,
    selectedCreatedUser,
    selectedIssuedUser,
    startingDate,
    endDate,
    startingDate2,
    endDate2,
    selected,
  ],
  filterRows
);

const selectedArrays = [
  selectedPVZ,
  selectedExpenditure,
  selectedType,
  selectedTypeOfExpenditure,
  selectedCompany,
  selectedCreatedUser,
  selectedNotation,
];


const nonEmptyCount = computed(() => {
  let count = 0;
  selectedArrays.forEach(selectedArray => {
    selectedArray.value.forEach(element => {
      if (element !== undefined && element !== null && element !== "") {
        count++;
      }
    });
  });

  if (startingDate.value) {
    count++;
  } else if (endDate.value) {
    count++;
  } else if (startingDate2.value) {
    count++;
  } else if (endDate2.value) {
    count++;
  }

  return count;
});

const uniqueType = ref(["Нал", "Безнал"]);
</script>

<template>
  <div v-auto-animate>
    <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
      <h1 class="text-xl font-bold">Фильтры</h1>
      <Icon
        @click="showFilters = !showFilters"
        class="cursor-pointer duration-200 hover:text-secondary-color"
        name="material-symbols:settings-rounded"
        size="24"
      />
      <h1 class="bg-secondary-color px-3 py-1 font-bold text-white rounded-full">
        {{ nonEmptyCount }}
      </h1>
    </div>

    <div
      v-if="showFilters"
      class="border-2 border-secondary-color border-dashed max-sm:px-3 max-sm:py-1 py-3 px-10 shadow-2xl mt-3"
    >
      <div class="grid grid-cols-2 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-x-5">
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Компания</h1>
          <VueMultiselect
            v-model="selectedCompany"
            :options="uniqueCompany"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите компанию"
          />
        </div>
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
          <h1>Тип</h1>
          <VueMultiselect
            v-model="selectedType"
            :options="uniqueType"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите тип"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Статья расхода</h1>
          <VueMultiselect
            v-model="selectedTypeOfExpenditure"
            :options="uniqueTypeOfExpenditure"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите статью"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Расход</h1>
          <VueMultiselect
            v-model="selectedExpenditure"
            :options="uniqueExpenditure"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите расход"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Комментарий</h1>
          <VueMultiselect
            v-model="selectedNotation"
            :options="uniqueNotation"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите комментарий"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Создано</h1>
          <VueMultiselect
            v-model="selectedCreatedUser"
            :options="uniqueCreatedUser"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите кем"
          />
        </div>
      </div>
      <UPopover 
        :popper="{ placement: 'auto' }"
        class="block max-sm:hidden my-5 max-w-[220px]" 
      >
        <UButton icon="i-heroicons-calendar-days-20-solid" color="orange">
          {{ format(selected.start, "d MMM, yyy") }} -
          {{ format(selected.end, "d MMM, yyy") }}
        </UButton>

        <template #panel="{ close }">
          <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
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
        :popper="{ placement: 'auto' }"
        class="hidden max-sm:block mx-auto max-w-[220px] my-5"
      >
        <UButton icon="i-heroicons-calendar-days-20-solid" color="orange">
          {{ format(selected.start, "d MMM, yyy") }} -
          {{ format(selected.end, "d MMM, yyy") }}
        </UButton>

        <template #panel="{ close }">
          <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
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
      <div class="flex justify-end gap-3 mt-3">
        <UIMainButton @click="filterRows(), (showFilters = !showFilters)"
          >Принять</UIMainButton
        >
        <UIActionButton @click="clearFields">Очистить фильтры</UIActionButton>
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
