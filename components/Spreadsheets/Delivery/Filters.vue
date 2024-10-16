<script setup lang="ts">
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

const props = defineProps({
  rows: { type: Array as PropType<IDelivery[]>, required: true },
  user: { type: Object as PropType<User> },
});

const storeRansom = useRansomStore();

let showFilters = ref(false);

const selectedName = ref<Array<string>>([]);
const selectedNameOfAction = ref<Array<string>>([]);
const selectedFromName = ref<Array<string>>([]);
const selectedPurchaseOfGoods = ref<Array<number>>([]);
const selectedDispatchPVZ = ref<Array<string>>([]);
const selectedOrderPVZ = ref<Array<string>>([]);
const selectedAdditionally = ref<Array<string>>([]);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);
const startingDate2 = ref<Date | string | null>(null);
const endDate2 = ref<Date | string | null>(null);

const uniqueOrderPVZ = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "orderPVZ");
});

const uniqueNameOfAction = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "nameOfAction");
});

const uniquePVZ = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "dispatchPVZ");
});

const uniqueNames = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "name");
});

const uniqueFromNames = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "fromName");
});

const uniqueAdditionally = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "additionally");
});

const uniquePurchaseOfGoods = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "purchaseOfGoods");
});

const filteredRows = ref<Array<IDelivery>>();

const emit = defineEmits(["filtered-rows"]);

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
  start: new Date(new Date().getFullYear(), 0, 1),
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
      (!selectedName.value.length || selectedName.value.includes(row.name)) &&
      (!selectedNameOfAction.value.length ||
        selectedNameOfAction.value.includes(row.nameOfAction)) &&
      (!selectedFromName.value.length ||
        selectedFromName.value.includes(row.fromName)) &&
      (!selectedPurchaseOfGoods.value.length ||
        selectedPurchaseOfGoods.value.includes(row.purchaseOfGoods)) &&
      (!selectedDispatchPVZ.value.length ||
        selectedDispatchPVZ.value.includes(row.dispatchPVZ)) &&
      (!selectedOrderPVZ.value.length ||
        selectedOrderPVZ.value.includes(row.orderPVZ)) &&
      (!selectedAdditionally.value.length ||
        selectedAdditionally.value.includes(row.additionally))
    );
  });
  emit("filtered-rows", filteredRows.value);
};

// &&
//       (!selected.value.start ||
//         new Date(row.sorted) >= new Date(newStartingDate)) &&
//       (!selected.value.end || new Date(row.sorted) <= new Date(newEndDate))

const currentDate = new Date();
function clearFields() {
  selectedAdditionally.value = [];
  selectedNameOfAction.value = [];
  selectedDispatchPVZ.value = [];
  selectedOrderPVZ.value = [];
  selectedFromName.value = [];
  selectedName.value = [];
  selectedAdditionally.value = [];
  selectedPurchaseOfGoods.value = [];
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  (selected.value.start = new Date(new Date().getFullYear(), 0, 1)),
    (selected.value.end = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    )),
    filterRows();
  clearLocalStorage();
}

watch(
  [
    selectedName,
    selectedNameOfAction,
    selectedFromName,
    selectedDispatchPVZ,
    selectedOrderPVZ,
    selectedAdditionally,
    selectedPurchaseOfGoods,
    startingDate,
    endDate,
    startingDate2,
    endDate2,
    selected,
  ],
  filterRows
);

function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key: string) {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

function saveFiltersToLocalStorage() {
  saveToLocalStorage("selectedName", selectedName.value);
  saveToLocalStorage("selectedFromName", selectedFromName.value);
  saveToLocalStorage("selectedNameOfAction", selectedNameOfAction.value);
  saveToLocalStorage("selectedDispatchPVZ", selectedDispatchPVZ.value);
  saveToLocalStorage("selectedOrderPVZ", selectedOrderPVZ.value);
  saveToLocalStorage("selectedAdditionally", selectedAdditionally.value);
  saveToLocalStorage("selectedPurchaseOfGoods", selectedPurchaseOfGoods.value);
  saveToLocalStorage("startingDate", startingDate.value);
  saveToLocalStorage("endDate", endDate.value);
  saveToLocalStorage("startingDate2", startingDate2.value);
  saveToLocalStorage("endDate2", endDate2.value);
  showFilters.value = false;
}

function clearLocalStorage() {
  const addressData = localStorage.getItem("addressData");
  localStorage.clear();
  if (addressData) {
    localStorage.setItem("addressData", addressData);
  }
  selectedName.value = [];
  selectedFromName.value = [];
  selectedNameOfAction.value = [];
  selectedDispatchPVZ.value = [];
  selectedOrderPVZ.value = [];
  selectedAdditionally.value = [];
  selectedPurchaseOfGoods.value = [];
  startingDate.value = null;
  endDate.value = null;
  startingDate2.value = null;
  endDate2.value = null;
}

onMounted(() => {
  const storedSelectedName = loadFromLocalStorage("selectedName");
  if (storedSelectedName !== null) {
    selectedName.value = storedSelectedName;
  }

  const storedSelectedFromName = loadFromLocalStorage("selectedFromName");
  if (storedSelectedFromName !== null) {
    selectedFromName.value = storedSelectedFromName;
  }

  const storedSelectedDispatchPVZ = loadFromLocalStorage("selectedDispatchPVZ");
  if (storedSelectedDispatchPVZ !== null) {
    selectedDispatchPVZ.value = storedSelectedDispatchPVZ;
  }

  const storedSelectedNameOfAction = loadFromLocalStorage(
    "selectedNameOfAction"
  );
  if (storedSelectedNameOfAction !== null) {
    selectedNameOfAction.value = storedSelectedNameOfAction;
  }

  const storedSelectedOrderPVZ = loadFromLocalStorage("selectedOrderPVZ");
  if (storedSelectedOrderPVZ !== null) {
    selectedOrderPVZ.value = storedSelectedOrderPVZ;
  }

  const storedSelectedAdditionally = loadFromLocalStorage(
    "selectedAdditionally"
  );
  if (storedSelectedAdditionally !== null) {
    selectedAdditionally.value = storedSelectedAdditionally;
  }

  const storedPurchaseOfGoods = loadFromLocalStorage("selectedPurchaseOfGoods");
  if (storedPurchaseOfGoods !== null) {
    selectedPurchaseOfGoods.value = storedPurchaseOfGoods;
  }

  const storedStartingDate = loadFromLocalStorage("startingDate");
  if (storedStartingDate !== null) {
    startingDate.value = storedStartingDate;
  }

  const storedEndDate = loadFromLocalStorage("endDate");
  if (storedEndDate !== null) {
    endDate.value = storedEndDate;
  }

  const storedStartingDate2 = loadFromLocalStorage("startingDate2");
  if (storedStartingDate2 !== null) {
    startingDate2.value = storedStartingDate2;
  }

  const storedEndDate2 = loadFromLocalStorage("endDate2");
  if (storedEndDate2 !== null) {
    endDate2.value = storedEndDate2;
  }

  filterRows();
});

let dateFilter = ref("paid");

const selectedArrays = [
  selectedName,
  selectedFromName,
  selectedNameOfAction,
  selectedDispatchPVZ,
  selectedOrderPVZ,
  selectedAdditionally,
  selectedPurchaseOfGoods,
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
  }

  return count;
});
</script>

<template>
  <div v-auto-animate class="">
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
      class="bg-white max-sm:px-3 max-sm:py-1 py-3 px-10 shadow-lg mt-3"
    >
      <div
        class="grid grid-cols-2 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-x-5"
      >
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Имя</h1>
          <VueMultiselect
            v-model="selectedName"
            :options="uniqueNames"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Телефон</h1>
          <VueMultiselect
            v-model="selectedFromName"
            :options="uniqueFromNames"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Название</h1>
          <VueMultiselect
            v-model="selectedNameOfAction"
            :options="uniqueNameOfAction"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Стоимость выкупа</h1>
          <VueMultiselect
            v-model="selectedPurchaseOfGoods"
            :options="uniquePurchaseOfGoods"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>ПВЗ</h1>
          <VueMultiselect
            v-model="selectedDispatchPVZ"
            :options="uniquePVZ"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>СЦ</h1>
          <VueMultiselect
            v-model="selectedOrderPVZ"
            :options="uniqueOrderPVZ"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Дополнительно</h1>
          <VueMultiselect
            v-model="selectedAdditionally"
            :options="uniqueAdditionally"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ПВЗ"
          />
        </div>
      </div>
      <div class="flex items-start space-y-2 flex-col mt-5 text-center">
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
        <UIMainButton
          @click="
            filterRows(),
              saveFiltersToLocalStorage(),
              (showFilters = !showFilters)
          "
          >Принять</UIMainButton
        >
        <UIActionButton @click="clearFields">Очистить фильтры</UIActionButton>
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
