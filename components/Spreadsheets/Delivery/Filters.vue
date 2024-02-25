<script setup lang="ts">
const props = defineProps({
  rows: { type: Array as PropType<IDelivery[]>, required: true },
  user: { type: Object as PropType<User> }
});

const storeRansom = useRansomStore();

let showFilters = ref(false);

const selectedName = ref<string | null>(null);
const selectedNameOfAction = ref<string | null>(null);
const selectedFromName = ref<string | null>(null);
const selectedPurchaseOfGoods = ref<number | null>(null);
const selectedDispatchPVZ = ref<string | null>(null);
const selectedOrderPVZ = ref<string | null>(null);
const selectedAdditionally = ref<string | null>(null);
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

const filterRows = () => {
  filteredRows.value = props.rows.slice();
  filteredRows.value = props.rows.filter((row) => {
    return (
      (!selectedFromName.value || row.fromName === selectedFromName.value) &&
      (!selectedNameOfAction.value || row.nameOfAction === selectedNameOfAction.value) &&
      (!selectedName.value || row.name === selectedName.value) &&
      (!selectedPurchaseOfGoods.value || row.purchaseOfGoods == selectedPurchaseOfGoods.value) &&
      (!selectedDispatchPVZ.value || row.dispatchPVZ === selectedDispatchPVZ.value) &&
      (!selectedOrderPVZ.value || row.orderPVZ === selectedOrderPVZ.value) &&
      (!selectedAdditionally.value || row.additionally === selectedAdditionally.value) &&
      (!startingDate.value || new Date(row.paid) >= new Date(startingDate.value)) &&
      (!endDate.value || new Date(row.paid) <= new Date(endDate.value)) &&
      (!startingDate2.value || new Date(row.sorted) >= new Date(startingDate2.value)) &&
      (!endDate2.value || new Date(row.sorted) <= new Date(endDate2.value))
    );
  });
  emit("filtered-rows", filteredRows.value);
};


function clearFields() {
  selectedAdditionally.value = "";
  selectedNameOfAction.value = "";
  selectedDispatchPVZ.value = "";
  selectedOrderPVZ.value = "";
  selectedFromName.value = "";
  selectedName.value = "";
  selectedAdditionally.value = "";
  selectedPurchaseOfGoods.value = "";
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  filterRows();
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
    endDate2
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
  saveToLocalStorage('selectedName', selectedName.value);
  saveToLocalStorage('selectedFromName', selectedFromName.value);
  saveToLocalStorage('selectedNameOfAction', selectedNameOfAction.value);
  saveToLocalStorage('selectedDispatchPVZ', selectedDispatchPVZ.value);
  saveToLocalStorage('selectedOrderPVZ', selectedOrderPVZ.value);
  saveToLocalStorage('selectedAdditionally', selectedAdditionally.value);
  saveToLocalStorage('selectedPurchaseOfGoods', selectedPurchaseOfGoods.value);
  saveToLocalStorage('startingDate', startingDate.value);
  saveToLocalStorage('endDate', endDate.value);
  saveToLocalStorage('startingDate2', startingDate2.value);
  saveToLocalStorage('endDate2', endDate2.value);
  showFilters.value = false;
}

function clearLocalStorage() {
  localStorage.clear();
  selectedName.value = null;
  selectedFromName.value = null;
  selectedNameOfAction.value = null;
  selectedDispatchPVZ.value = null;
  selectedOrderPVZ.value = null;
  selectedAdditionally.value = null;
  selectedPurchaseOfGoods.value = null;
  startingDate.value = null;
  endDate.value = null;
  startingDate2.value = null;
  endDate2.value = null;
}

onMounted(() => {
  const storedSelectedName = loadFromLocalStorage('selectedName');
  if (storedSelectedName !== null) {
    selectedName.value = storedSelectedName;
  }

  const storedSelectedFromName = loadFromLocalStorage('selectedFromName');
  if (storedSelectedFromName !== null) {
    selectedFromName.value = storedSelectedFromName;
  }

  const storedSelectedDispatchPVZ = loadFromLocalStorage('selectedDispatchPVZ');
  if (storedSelectedDispatchPVZ !== null) {
    selectedDispatchPVZ.value = storedSelectedDispatchPVZ;
  }

  const storedSelectedNameOfAction = loadFromLocalStorage('selectedNameOfAction');
  if (storedSelectedNameOfAction !== null) {
    selectedNameOfAction.value = storedSelectedNameOfAction;
  }

  const storedSelectedOrderPVZ = loadFromLocalStorage('selectedOrderPVZ');
  if (storedSelectedOrderPVZ !== null) {
    selectedOrderPVZ.value = storedSelectedOrderPVZ;
  }

  const storedSelectedAdditionally = loadFromLocalStorage('selectedAdditionally');
  if (storedSelectedAdditionally !== null) {
    selectedAdditionally.value = storedSelectedAdditionally;
  }

  const storedPurchaseOfGoods = loadFromLocalStorage('selectedPurchaseOfGoods');
  if (storedPurchaseOfGoods !== null) {
    selectedPurchaseOfGoods.value = storedPurchaseOfGoods;
  }

  const storedStartingDate = loadFromLocalStorage('startingDate');
  if (storedStartingDate !== null) {
    startingDate.value = storedStartingDate;
  }

  const storedEndDate = loadFromLocalStorage('endDate');
  if (storedEndDate !== null) {
    endDate.value = storedEndDate;
  }

  const storedStartingDate2 = loadFromLocalStorage('startingDate2');
  if (storedStartingDate2 !== null) {
    startingDate2.value = storedStartingDate2;
  }

  const storedEndDate2 = loadFromLocalStorage('endDate2');
  if (storedEndDate2 !== null) {
    endDate2.value = storedEndDate2;
  }
})

let dateFilter = ref('paid')
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <h1 class="text-xl font-bold">Фильтры</h1>
      <Icon @click="showFilters = !showFilters" class="cursor-pointer duration-200 hover:text-secondary-color"
        name="solar:filters-line-duotone" size="24" />
    </div>
    <div v-if="showFilters" class="border-2 border-gray-300 p-3 mt-3 border-dashed">
      <div class="grid grid-cols-2 max-xl:grid-cols-2 max-md:grid-cols-1">
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Имя: </h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedName" list="uniqueNames">
          <datalist id="uniqueNames" class="">
            <option v-for="value in uniqueNames" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Телефон: </h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedFromName" list="uniqueFromNames">
          <datalist id="uniqueFromNames" class="">
            <option v-for="value in uniqueFromNames" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Название: </h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedNameOfAction" list="uniqueNameOfAction">
          <datalist id="uniqueNameOfAction" class="">
            <option v-for="value in uniqueNameOfAction" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Стоимость выкупа: </h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedPurchaseOfGoods" list="uniquePurchaseOfGoods">
          <datalist id="uniquePurchaseOfGoods" class="">
            <option v-for="value in uniquePurchaseOfGoods" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>ПВЗ: </h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedDispatchPVZ" list="uniquePVZ">
          <datalist id="uniquePVZ" class="">
            <option v-for="value in uniquePVZ" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>СЦ: </h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedOrderPVZ" list="uniqueOrderPVZ">
          <datalist id="uniqueOrderPVZ" class="">
            <option v-for="value in uniqueOrderPVZ" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Дополнительно: </h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedAdditionally" list="uniqueAdditionally">
          <datalist id="uniqueAdditionally" class="">
            <option v-for="value in uniqueAdditionally" :value="value">{{ value }}</option>
          </datalist>
        </div>
      </div>
      <div v-if="user?.role !== 'SORTIROVKA'">
        <div class="mt-10">
          <div>
            <select v-model="dateFilter"
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3">
              <option value="paid" selected>Дата оплаты</option>
              <option value="sorted">Дата сортировки</option>
            </select>
          </div>
        </div>
        <div class="rid grid-cols-1">
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'paid'">
            <h1>От Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="startingDate" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'paid'">
            <h1>До Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="endDate" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'sorted'">
            <h1>От Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="startingDate2" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'sorted'">
            <h1>До Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="endDate2" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-3">
          <UIMainButton @click="showFilters = false, saveFiltersToLocalStorage()">Принять</UIMainButton>
          <UIMainButton @click="clearFields(), clearLocalStorage()">Очистить фильтры</UIMainButton>
        </div>
      </div>
    </div>
  </div>
</template>
