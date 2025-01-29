<script setup lang="ts">
import VueMultiselect from "vue-multiselect";
import { vAutoAnimate } from "@formkit/auto-animate";

const props = defineProps({
  rows: { type: Array as PropType<IOurRansom[]>, required: true },
  user: { type: Object as PropType<User> },
});

const storeRansom = useRansomStore();

let showFilters = ref(false);

const selectedCell = ref<Array<string>>([]);
const selectedDPStatus = ref<any>();
const selectedFromName = ref<Array<string>>([]);
const selectedProductName = ref<string | null>(null);
const selectedDispatchPVZ = ref<Array<string>>([]);
const selectedOrderPVZ = ref<Array<string>>([]);
const selectedOrderAccount = ref<Array<string>>([]);
const selectedNotation = ref<Array<string>>([]);
const selectedAdditionally = ref<Array<string>>([]);
const selectedPriceSite = ref<Array<string>>([]);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string>();
const startingDate2 = ref<Date | string>();
const endDate2 = ref<Date | string>();
const startingDate3 = ref<Date | string>();
const endDate3 = ref<Date | string>();
const startingDate4 = ref<Date | string>();
const endDate4 = ref<Date | string>();

const uniqueOrderAccounts = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "orderAccount");
});

const uniqueNotation = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "notation");
});

const uniqueOrderPVZ = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "orderPVZ");
});

const uniquePVZ = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "dispatchPVZ");
});

const uniqueCells = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "cell");
});

const uniqueFromNames = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "fromName");
});

const uniqueProductNames = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "productName");
});

const uniqueAdditionally = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "additionally");
});

const uniquePriceSite = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "priceSite");
});

const filteredRows = ref<Array<IOurRansom>>();

const emit = defineEmits(["filtered-rows"]);

const filterRows = () => {
  let newStartingDate: string | number | Date;
  let newEndDate: string | number | Date;
  let newStartingDate2: string | number | Date;
  let newEndDate2: string | number | Date;
  let newStartingDate3: string | number | Date;
  let newEndDate3: string | number | Date;
  let newStartingDate4: string | number | Date;
  let newEndDate4: string | number | Date;

  if (startingDate.value) {
    newStartingDate = new Date(startingDate.value);
    newStartingDate.setHours(0);
    newStartingDate.setMinutes(0);
    newStartingDate.setSeconds(0);
    newStartingDate.setMilliseconds(0);
  }

  if (endDate.value) {
    newEndDate = new Date(endDate.value);
    newEndDate.setHours(23);
    newEndDate.setMinutes(59);
    newEndDate.setSeconds(59);
    newEndDate.setMilliseconds(0);
  }

  if (startingDate2.value) {
    newStartingDate2 = new Date(startingDate2.value);
    newStartingDate2.setHours(23);
    newStartingDate2.setMinutes(59);
    newStartingDate2.setSeconds(59);
    newStartingDate2.setMilliseconds(0);
  }

  if (endDate2.value) {
    newEndDate2 = new Date(endDate2.value);
    newEndDate2.setHours(23);
    newEndDate2.setMinutes(59);
    newEndDate2.setSeconds(59);
    newEndDate2.setMilliseconds(0);
  }

  if (startingDate3.value) {
    newStartingDate3 = new Date(startingDate3.value);
    newStartingDate3.setHours(0);
    newStartingDate3.setMinutes(0);
    newStartingDate3.setSeconds(0);
    newStartingDate3.setMilliseconds(0);
  }

  if (endDate3.value) {
    newEndDate3 = new Date(endDate3.value);
    newEndDate3.setHours(23);
    newEndDate3.setMinutes(59);
    newEndDate3.setSeconds(59);
    newEndDate3.setMilliseconds(0);
  }

  if (startingDate4.value) {
    newStartingDate4 = new Date(startingDate4.value);
    newStartingDate4.setHours(0);
    newStartingDate4.setMinutes(0);
    newStartingDate4.setSeconds(0);
    newStartingDate4.setMilliseconds(0);
  }

  if (endDate4.value) {
    newEndDate4 = new Date(endDate4.value);
    newEndDate4.setHours(23);
    newEndDate4.setMinutes(59);
    newEndDate4.setSeconds(59);
    newEndDate4.setMilliseconds(0);
  }

  filteredRows.value = props.rows.slice();
  filteredRows.value = props.rows.filter((row) => {
    return (
      (!selectedDPStatus.value || selectedDPStatus.value == row.dp) &&
      (!selectedCell.value.length || selectedCell.value.includes(row.cell)) &&
      (!selectedFromName.value.length ||
        selectedFromName.value.includes(row.fromName)) &&
      (!selectedProductName.value ||
        (row.productName &&
          row.productName
            .toLowerCase()
            .includes(selectedProductName.value.trim().toLowerCase()))) &&
      (!selectedDispatchPVZ.value.length ||
        selectedDispatchPVZ.value.includes(row.dispatchPVZ)) &&
      (!selectedOrderPVZ.value.length ||
        selectedOrderPVZ.value.includes(row.orderPVZ)) &&
      (!selectedOrderAccount.value.length ||
        selectedOrderAccount.value.includes(row.orderAccount)) &&
      (!selectedAdditionally.value.length ||
        selectedAdditionally.value.includes(row.additionally)) &&
      (!selectedNotation.value.length ||
        (row.notation &&
          selectedNotation.value.includes(row.notation.trim()))) &&
      (!selectedPriceSite.value.length ||
        selectedPriceSite.value.includes(row.priceSite.toString())) &&
      (!startingDate.value ||
        (row.issued && new Date(row.issued) >= new Date(newStartingDate))) &&
      (!endDate.value ||
        (row.issued && new Date(row.issued) <= new Date(newEndDate))) &&
      (!startingDate2.value ||
        (row.deliveredSC &&
          new Date(row.deliveredSC) >= new Date(newStartingDate2))) &&
      (!endDate2.value ||
        (row.deliveredSC &&
          new Date(row.deliveredSC) <= new Date(newEndDate2))) &&
      (!startingDate3.value ||
        new Date(row.created_at) >= new Date(newStartingDate3)) &&
      (!endDate3.value || new Date(row.created_at) <= new Date(newEndDate3)) &&
      (!startingDate4.value ||
        (row.deliveredPVZ &&
          new Date(row.deliveredPVZ) >= new Date(newStartingDate4))) &&
      (!endDate4.value ||
        (row.deliveredPVZ &&
          new Date(row.deliveredPVZ) <= new Date(newEndDate4)))
    );
  });
  emit("filtered-rows", filteredRows.value);
};

function clearFields() {
  selectedCell.value = [];
  selectedDPStatus.value = null;
  selectedAdditionally.value = [];
  selectedDispatchPVZ.value = [];
  selectedOrderPVZ.value = [];
  selectedOrderAccount.value = [];
  selectedFromName.value = [];
  selectedAdditionally.value = [];
  selectedNotation.value = [];
  selectedProductName.value = "";
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  startingDate3.value = "";
  endDate3.value = "";
  startingDate4.value = "";
  endDate4.value = "";
  filterRows();
}

watch(
  [
    selectedDPStatus,
    selectedCell,
    selectedFromName,
    selectedProductName,
    selectedDispatchPVZ,
    selectedOrderPVZ,
    selectedNotation,
    selectedOrderAccount,
    selectedAdditionally,
    selectedPriceSite,
    startingDate,
    endDate,
    startingDate2,
    endDate2,
    startingDate3,
    endDate3,
    startingDate4,
    endDate4,
  ],
  filterRows
);

let variables = ref([
  selectedDPStatus,
  selectedCell,
  selectedFromName,
  selectedProductName,
  selectedDispatchPVZ,
  selectedOrderPVZ,
  selectedOrderAccount,
  selectedAdditionally,
  selectedNotation,
  selectedPriceSite,
  startingDate,
  endDate,
  startingDate2,
  endDate2,
  startingDate3,
  endDate3,
  startingDate4,
  endDate4,
]);

const selectedArrays = [
  selectedCell,
  selectedFromName,
  selectedDispatchPVZ,
  selectedOrderPVZ,
  selectedOrderAccount,
  selectedAdditionally,
  selectedNotation,
  selectedPriceSite,
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
  } else if (selectedProductName.value) {
    count++;
  } else if (selectedDPStatus.value) {
    count++;
  }

  return count;
});

function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key: string) {
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    try {
      return JSON.parse(storedValue);
    } catch (e) {
      console.warn("Ошибка парсинга JSON:", e);
      return null;
    }
  }
  return null;
}

function saveFiltersToLocalStorage() {
  saveToLocalStorage("selectedDPStatus", selectedDPStatus.value);
  saveToLocalStorage("selectedCell", selectedCell.value);
  saveToLocalStorage("selectedFromName", selectedFromName.value);
  saveToLocalStorage("selectedProductName", selectedProductName.value);
  saveToLocalStorage("selectedDispatchPVZ", selectedDispatchPVZ.value);
  saveToLocalStorage("selectedOrderPVZ", selectedOrderPVZ.value);
  saveToLocalStorage("selectedOrderAccount", selectedOrderAccount.value);
  saveToLocalStorage("selectedNotation", selectedNotation.value);
  saveToLocalStorage("selectedAdditionally", selectedAdditionally.value);
  saveToLocalStorage("selectedPriceSite", selectedPriceSite.value);
  saveToLocalStorage("startingDate", startingDate.value);
  saveToLocalStorage("endDate", endDate.value);
  saveToLocalStorage("startingDate2", startingDate2.value);
  saveToLocalStorage("endDate2", endDate2.value);
  saveToLocalStorage("startingDate3", startingDate3.value);
  saveToLocalStorage("endDate3", endDate3.value);
  saveToLocalStorage("startingDate4", startingDate4.value);
  saveToLocalStorage("endDate4", endDate4.value);
  showFilters.value = false;
}

function clearLocalStorage() {
  localStorage.removeItem("selectedDPStatus");
  localStorage.removeItem("selectedCell");
  localStorage.removeItem("selectedFromName");
  localStorage.removeItem("selectedOrderPVZ");
  localStorage.removeItem("selectedProductName");
  localStorage.removeItem("selectedDispatchPVZ");
  localStorage.removeItem("selectedOrderAccount");
  localStorage.removeItem("selectedNotation");
  localStorage.removeItem("selectedAdditionally");
  localStorage.removeItem("selectedPriceSite");
  localStorage.removeItem("startingDate");
  localStorage.removeItem("endDate");
  localStorage.removeItem("startingDate2");
  localStorage.removeItem("endDate2");
  localStorage.removeItem("startingDate3");
  localStorage.removeItem("endDate3");
  localStorage.removeItem("startingDate4");
  localStorage.removeItem("endDate4");

  const addressData = localStorage.getItem("addressData");
  if (addressData) {
    localStorage.setItem("addressData", addressData);
  }
  selectedDPStatus.value = null;
  selectedCell.value = [];
  selectedFromName.value = [];
  selectedProductName.value = "";
  selectedDispatchPVZ.value = [];
  selectedOrderPVZ.value = [];
  selectedOrderAccount.value = [];
  selectedNotation.value = [];
  selectedAdditionally.value = [];
  selectedPriceSite.value = [];
  startingDate.value = null;
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  startingDate3.value = "";
  endDate3.value = "";
  startingDate4.value = "";
  endDate4.value = "";
}

onMounted(() => {
  const storedSelectedDPStatus = loadFromLocalStorage("storedSelectedDPStatus");
  if (storedSelectedDPStatus !== null) {
    selectedDPStatus.value = storedSelectedDPStatus;
  }

  const storedSelectedCell = loadFromLocalStorage("selectedCell");
  if (storedSelectedCell !== null) {
    selectedCell.value = storedSelectedCell;
  }

  const storedSelectedFromName = loadFromLocalStorage("selectedFromName");
  if (storedSelectedFromName !== null) {
    selectedFromName.value = storedSelectedFromName;
  }

  const storedSelectedProductName = loadFromLocalStorage("selectedProductName");
  if (storedSelectedProductName !== null) {
    selectedProductName.value = storedSelectedProductName;
  }

  const storedSelectedDispatchPVZ = loadFromLocalStorage("selectedDispatchPVZ");
  if (storedSelectedDispatchPVZ !== null) {
    selectedDispatchPVZ.value = storedSelectedDispatchPVZ;
  }

  const storedSelectedOrderPVZ = loadFromLocalStorage("selectedOrderPVZ");
  if (storedSelectedOrderPVZ !== null) {
    selectedOrderPVZ.value = storedSelectedOrderPVZ;
  }

  const storedSelectedOrderAccount = loadFromLocalStorage(
    "selectedOrderAccount"
  );
  if (storedSelectedOrderAccount !== null) {
    selectedOrderAccount.value = storedSelectedOrderAccount;
  }

  const storedSelectedAdditionally = loadFromLocalStorage(
    "selectedAdditionally"
  );
  if (storedSelectedAdditionally !== null) {
    selectedAdditionally.value = storedSelectedAdditionally;
  }

  const storedSelectedPriceSite = loadFromLocalStorage("selectedPriceSite");
  if (storedSelectedPriceSite !== null) {
    selectedPriceSite.value = storedSelectedPriceSite;
  }

  const storedNotation = loadFromLocalStorage("storedNotation");
  if (storedNotation !== null) {
    selectedNotation.value = storedNotation;
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

  const storedStartingDate3 = loadFromLocalStorage("startingDate3");
  if (storedStartingDate3 !== null) {
    startingDate3.value = storedStartingDate3;
  }

  const storedEndDate3 = loadFromLocalStorage("endDate3");
  if (storedEndDate3 !== null) {
    endDate3.value = storedEndDate3;
  }

  const storedStartingDate4 = loadFromLocalStorage("startingDate4");
  if (storedStartingDate4 !== null) {
    startingDate4.value = storedStartingDate4;
  }

  const storedEndDate4 = loadFromLocalStorage("endDate4");
  if (storedEndDate4 !== null) {
    endDate4.value = storedEndDate4;
  }
});

let dateFilter = ref("issued");
</script>

<template>
  <div v-auto-animate>
    <div class="flex items-center gap-3 mt-10 max-xl:mt-6">
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
      class="bg-white max-sm:px-3 max-sm:py-1 pt-3 pb-5 px-10 shadow-lg mt-3"
    >
      <div
        class="grid grid-cols-2 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-x-5"
      >
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Ячейка</h1>
          <VueMultiselect
            v-model="selectedCell"
            :options="uniqueCells"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите ячейку"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Телефон</h1>
          <VueMultiselect
            v-model="selectedFromName"
            :options="uniqueFromNames"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите телефон"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Название товара</h1>
          <input
            type="text"
            class="bg-transparent w-full min-h-[40px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedProductName"
            list="uniqueProductNames"
          />
          <datalist id="uniqueProductNames" class="">
            <option v-for="value in uniqueProductNames" :value="value">
              {{ value }}
            </option>
          </datalist>
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Стоимость сайт</h1>
          <VueMultiselect
            v-model="selectedPriceSite"
            :options="uniquePriceSite"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите стоимость сайт"
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
            placeholder="Выберите СЦ"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Аккаунт</h1>
          <VueMultiselect
            v-model="selectedOrderAccount"
            :options="uniqueOrderAccounts"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите аккаунт"
          />
        </div>

        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Дополнительно</h1>
          <VueMultiselect
            v-model="selectedAdditionally"
            :options="uniqueAdditionally"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите дополнительно"
          />
        </div>

        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Примечание</h1>
          <VueMultiselect
            v-model="selectedNotation"
            :options="uniqueNotation"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите дополнительно"
          />
        </div>

        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Статус</h1>
          <select
            class="bg-transparent w-full min-h-[40px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedDPStatus"
          >
            <option value="1">Предоплата</option>
            <option value="0">Постоплата</option>
          </select>
        </div>
      </div>
      <div v-if="user?.role !== 'SORTIROVKA'">
        <div class="mt-10">
          <div>
            <select
              v-model="dateFilter"
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3"
            >
              <option value="issued" selected>Дата выдачи</option>
              <option value="sorted">Дата сортировки</option>
              <option value="delivered">Дата доставки на пвз</option>
              <option value="created">Дата создания</option>
            </select>
          </div>
        </div>
        <div
          class="flex items-center max-sm:flex-col max-sm:items-start max-sm:gap-5 mt-5"
        >
          <div
            class="flex items-center gap-3 mr-5"
            v-if="dateFilter === 'issued'"
          >
            <h1 class="max-sm:mr-3">С</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="startingDate"
            />
          </div>
          <div
            class="flex items-center gap-3 max-sm:mb-7"
            v-if="dateFilter === 'issued'"
          >
            <h1>По</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="endDate"
            />
          </div>
          <div
            class="flex items-center gap-3 mr-5"
            v-if="dateFilter === 'sorted'"
          >
            <h1 class="max-sm:mr-3">C</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="startingDate2"
            />
          </div>
          <div
            class="flex items-center gap-3 max-sm:mb-7"
            v-if="dateFilter === 'sorted'"
          >
            <h1>По</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="endDate2"
            />
          </div>
          <div
            class="flex items-center gap-3 mr-5"
            v-if="dateFilter === 'created'"
          >
            <h1 class="max-sm:mr-3">C</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="startingDate3"
            />
          </div>
          <div
            class="flex items-center gap-3 max-sm:mb-7"
            v-if="dateFilter === 'created'"
          >
            <h1>По</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="endDate3"
            />
          </div>
          <div
            class="flex items-center gap-3 mr-5"
            v-if="dateFilter === 'delivered'"
          >
            <h1 class="max-sm:mr-3">C</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="startingDate4"
            />
          </div>
          <div
            class="flex items-center gap-3 max-sm:mb-7"
            v-if="dateFilter === 'delivered'"
          >
            <h1>По</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              onchange="this.className=(this.value!=''?'has-value':'')"
              v-model="endDate4"
            />
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-3">
        <UIMainButton @click="saveFiltersToLocalStorage(), filterRows()"
          >Принять</UIMainButton
        >
        <UIMainButton @click="clearFields(), clearLocalStorage()"
          >Очистить фильтры</UIMainButton
        >
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
