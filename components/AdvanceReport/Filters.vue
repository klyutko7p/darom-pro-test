<script setup lang="ts">
const props = defineProps({
  rows: { type: Array as PropType<IAdvanceReport[]>, required: true },
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

interface DurationType {
  month?: "current" | "0" | "1" | string;
  years?: number;
}

interface SelectedDateRange {
  start: Date;
  end: Date;
}

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
  start: new Date(2024, 0, 1),
  end: new Date(),
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

const storeAdvanceReports = useAdvanceReports();

let showFilters = ref(false);

const selectedPVZ = ref<Array<string>>([]);
const selectedType = ref<Array<string>>([]);
const selectedExpenditure = ref<Array<string>>([]);
const selectedTypeOfExpenditure = ref<Array<string>>([]);
const selectedNotation = ref<Array<string>>([]);
const selectedCompany = ref<Array<string>>([]);
const selectedCreatedUser = ref<Array<string>>([]);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);
const startingDate2 = ref<Date | string | null>(null);
const endDate2 = ref<Date | string | null>(null);

let pvz = ref([
  "Ряженое",
  "Алексеевка",
  "Латоново",
  "Надежда",
  "Александровка",
  "Новониколаевка",
  "Политотдельское",
  "Мещерино",
  "Коломенское ЯМ",
  "Коломенское WB",
  "Бессоново WB",
  "Бессоново OZ",
  "Новоандриановка",
  "Офис",
  "НаДом",
]);

pvz.value = pvz.value.sort((a, b) => a.localeCompare(b, "ru"));

pvz.value.push("ПВЗ_1");
pvz.value.push("ПВЗ_2");
pvz.value.push("ПВЗ_3");
pvz.value.push("ПВЗ_4");
pvz.value.push("ППВЗ_5");
pvz.value.push("ППВЗ_7");
pvz.value.push("ПВЗ_8");
pvz.value.push("ППВЗ_9");
pvz.value.push("ПВЗ_10");
pvz.value.push("ПВЗ_11");

const uniquePVZ = computed(() => {
  // let array = storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "PVZ");
  // let newArray = array.map((string) => {
  //   if (string === "Алексеевк��") {
  //     return "Алексеевка";
  //   }
  //   return string;
  // });
  // newArray = new Set(newArray);
  return pvz.value;
});

const uniqueExpenditure = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "expenditure");
});

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

const uniqueNotation = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "notation");
});

const uniqueCompany = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "company");
});

const uniqueCreatedUser = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "createdUser");
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

  if (props.user.username !== "Власенкова") {
    filteredRows.value = props.rows.slice();
    filteredRows.value = props.rows.filter((row) => {
      return (
        (!selectedPVZ.value.length || selectedPVZ.value.includes(row.PVZ)) &&
        (!selectedType.value.length || selectedType.value.includes(row.type)) &&
        (!selectedExpenditure.value.length ||
          selectedExpenditure.value.includes(row.expenditure)) &&
        (!selectedTypeOfExpenditure.value.length ||
          selectedTypeOfExpenditure.value.includes(row.typeOfExpenditure)) &&
        (!selectedNotation.value.length ||
          selectedNotation.value.some((notation) =>
            row.notation
              ? row.notation.toLowerCase().includes(notation.toLowerCase())
              : row.notation
          )) &&
        (!selectedCompany.value.length ||
          selectedCompany.value.includes(row.company)) &&
        (!selectedCreatedUser.value.length ||
          selectedCreatedUser.value.includes(row.createdUser)) &&
        (!selected.value.start ||
          new Date(row.date) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.date) <= new Date(newEndDate))
      );
    });
  } else {
    filteredRows.value = props.rows.slice();
    filteredRows.value = props.rows.filter((row) => {
      return (
        (!selectedPVZ.value.length || selectedPVZ.value.includes(row.PVZ)) &&
        (!selectedType.value.length || selectedType.value.includes(row.type)) &&
        (!selectedExpenditure.value.length ||
          selectedExpenditure.value.includes(row.expenditure)) &&
        (!selectedTypeOfExpenditure.value.length ||
          selectedTypeOfExpenditure.value.includes(row.typeOfExpenditure)) &&
        (!selectedNotation.value.length ||
          selectedNotation.value.some((notation) =>
            row.notation
              ? row.notation.toLowerCase().includes(notation.toLowerCase())
              : row.notation
          )) &&
        (!selectedCompany.value.length ||
          selectedCompany.value.includes(row.company)) &&
        (!selectedCreatedUser.value.length ||
          selectedCreatedUser.value.includes(row.createdUser)) &&
        (!selected.value.start ||
          new Date(row.created_at) >= new Date(newStartingDate)) &&
        (!selected.value.end ||
          new Date(row.created_at) <= new Date(newEndDate))
      );
    });
  }

  emit("filtered-rows", [filteredRows.value, selected.value]);
  showFilters.value = false;
};

function clearFields() {
  selectedPVZ.value = [];
  selectedType.value = [];
  selectedExpenditure.value = [];
  selectedTypeOfExpenditure.value = [];
  selectedCompany.value = [];
  selectedNotation.value = [];
  selectedCreatedUser.value = [];
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  selected.value.start = new Date(new Date().getFullYear(), 0, 1);
  selected.value.end = new Date();
  filterRows();
  showFilters.value = false;
}

// watch(
//   [
//     selectedPVZ,
//     selectedExpenditure,
//     selectedTypeOfExpenditure,
//     selectedType,
//     selectedCompany,
//     selectedCreatedUser,
//     selectedNotation,
//     startingDate,
//     endDate,
//     startingDate2,
//     endDate2,
//   ],
//   filterRows
// );

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
  } else if (startingDate2.value) {
    count++;
  } else if (endDate2.value) {
    count++;
  }

  return count;
});

const uniqueType = ref(["Нал", "Безнал"]);

function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key: string) {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

function saveFiltersToLocalStorage() {
  saveToLocalStorage("selectedPVZAR", selectedPVZ.value);
  saveToLocalStorage(
    "selectedTypeOfExpenditureAR",
    selectedTypeOfExpenditure.value
  );
  saveToLocalStorage("selectedExpenditureAR", selectedExpenditure.value);
  saveToLocalStorage("selectedTypeAR", selectedType.value);
  saveToLocalStorage("selectedCompanyAR", selectedCompany.value);
  saveToLocalStorage("selectedCreatedUserAR", selectedCreatedUser.value);
  saveToLocalStorage("selectedNotationAR", selectedNotation.value);
  saveToLocalStorage("startingDateAR", selected.value.start);
  saveToLocalStorage("endDateAR", selected.value.end);
  saveToLocalStorage("startingDate2AR", startingDate2.value);
  saveToLocalStorage("endDate2AR", endDate2.value);
  showFilters.value = false;
}

function clearLocalStorage() {
  const addressData = localStorage.getItem("addressData");
  localStorage.clear();
  if (addressData) {
    localStorage.setItem("addressData", addressData);
  }
  selectedPVZ.value = [];
  selectedExpenditure.value = [];
  selectedTypeOfExpenditure.value = [];
  selectedType.value = [];
  selectedCompany.value = [];
  selectedCreatedUser.value = [];
  selectedNotation.value = [];
  startingDate.value = null;
  endDate.value = null;
  startingDate2.value = null;
  endDate2.value = null;
}

onMounted(() => {
  const storedSelectedPVZ = loadFromLocalStorage("selectedPVZAR");
  if (storedSelectedPVZ !== null) {
    selectedPVZ.value = storedSelectedPVZ;
  }

  const storedSelectedTypeOfExpenditure = loadFromLocalStorage(
    "selectedTypeOfExpenditureAR"
  );
  if (storedSelectedTypeOfExpenditure !== null) {
    selectedTypeOfExpenditure.value = storedSelectedTypeOfExpenditure;
  }

  const storedSelectedExpenditure = loadFromLocalStorage(
    "selectedExpenditureAR"
  );
  if (storedSelectedExpenditure !== null) {
    selectedExpenditure.value = storedSelectedExpenditure;
  }

  const storedSelectedType = loadFromLocalStorage("selectedTypeAR");
  if (storedSelectedType !== null) {
    selectedType.value = storedSelectedType;
  }

  const storedSelectedCompany = loadFromLocalStorage("selectedCompanyAR");
  if (storedSelectedCompany !== null) {
    selectedCompany.value = storedSelectedCompany;
  }

  const storedSelectedCreatedUser = loadFromLocalStorage(
    "selectedCreatedUserAR"
  );
  if (storedSelectedCreatedUser !== null) {
    selectedCreatedUser.value = storedSelectedCreatedUser;
  }

  const storedSelectedNotation = loadFromLocalStorage("selectedNotationAR");
  if (storedSelectedNotation !== null) {
    selectedNotation.value = storedSelectedNotation;
  }

  const storedNotation = loadFromLocalStorage("storedNotationAR");
  if (storedNotation !== null) {
    selectedNotation.value = storedNotation;
  }

  const storedStartingDate = loadFromLocalStorage("startingDateAR");
  if (storedStartingDate !== null) {
    selected.value.start = storedStartingDate;
  }

  const storedEndDate = loadFromLocalStorage("endDateAR");
  if (storedEndDate !== null) {
    selected.value.end = storedEndDate;
  }

  const storedStartingDate2 = loadFromLocalStorage("startingDate2AR");
  if (storedStartingDate2 !== null) {
    startingDate2.value = storedStartingDate2;
  }

  const storedEndDate2 = loadFromLocalStorage("endDate2AR");
  if (storedEndDate2 !== null) {
    endDate2.value = storedEndDate2;
  }

  filterRows();
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
      class="bg-white max-sm:px-3 max-sm:py-1 py-3 px-10 shadow-2xl mt-3 mb-5"
    >
      <div
        class="grid grid-cols-2 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-x-5"
      >
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

      <div class="flex justify-end gap-3 mt-3 mb-5">
        <UIMainButton @click="saveFiltersToLocalStorage(), filterRows()"
          >Принять</UIMainButton
        >
        <UIActionButton @click="clearFields(), clearLocalStorage()"
          >Очистить фильтры</UIActionButton
        >
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
