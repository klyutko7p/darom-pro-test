<script setup lang="ts">
import type { PropType } from "vue";
import VueMultiselect from "vue-multiselect";
const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  uniqueOrderAccounts: { type: Array as PropType<string[]>, required: true },
  uniqueNotation: { type: Array as PropType<string[]>, required: true },
  uniqueCreatedUser: { type: Array as PropType<string[]>, required: true },
  uniqueOrderPVZ: { type: Array as PropType<string[]>, required: true },
  uniquePVZ: { type: Array as PropType<string[]>, required: true },
  uniqueCells: { type: Array as PropType<string[]>, required: true },
  uniqueFromNames: { type: Array as PropType<string[]>, required: true },
  uniqueAdditionally: { type: Array as PropType<string[]>, required: true },
  uniquePriceSite: { type: Array as PropType<string[]>, required: true },
});

const storeRansom = useRansomStore();

let showFilters = ref(false);
let isLoading = ref(false);
let rows = ref<Array<IOurRansom>>([]);

const selectedCell = ref<Array<string>>([]);
const selectedFromName = ref<Array<string>>([]);
const selectedDispatchPVZ = ref<Array<string>>([]);
const selectedOrderPVZ = ref<Array<string>>([]);
const selectedOrderAccount = ref<Array<string>>([]);
const selectedNotation = ref<Array<string>>([]);
const selectedCreatedUser = ref<Array<string>>([]);
const selectedAdditionally = ref<Array<string>>([]);
const selectedPriceSite = ref<Array<string>>([]);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);
const startingDate2 = ref<Date | string | null>(null);
const endDate2 = ref<Date | string | null>(null);
const startingDate3 = ref<Date | string | null>(null);
const endDate3 = ref<Date | string | null>(null);
const startingDate4 = ref<Date | string | null>(null);
const endDate4 = ref<Date | string | null>(null);

const uniqueOrderAccounts = ref<Array<string>>(props.uniqueOrderAccounts);
const uniqueNotation = ref<Array<string>>(props.uniqueNotation);
const uniqueOrderPVZ = ref<Array<string>>(props.uniqueOrderPVZ);
const uniquePVZ = ref<Array<string>>(props.uniquePVZ);
const uniqueCells = ref<Array<string>>(props.uniqueCells);
const uniqueFromNames = ref<Array<string>>(props.uniqueFromNames);
const uniqueAdditionally = ref<Array<string>>(props.uniqueAdditionally);
const uniquePriceSite = ref<Array<string>>(props.uniquePriceSite);

onMounted(async () => {
  const storedSelectedCell = loadFromLocalStorage("selectedCell");
  if (storedSelectedCell !== null) {
    selectedCell.value = storedSelectedCell;
  }

  const storedSelectedFromName = loadFromLocalStorage("selectedFromName");
  if (storedSelectedFromName !== null) {
    selectedFromName.value = storedSelectedFromName;
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

  const storedCreatedUser = loadFromLocalStorage("selectedCreatedUser");
  if (storedCreatedUser !== null) {
    selectedCreatedUser.value = storedCreatedUser;
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

const filteredRows = ref<Array<IOurRansom>>();

const emit = defineEmits(["filtered-rows"]);

function processDate(dateValue, isStartDate) {
  let date = new Date(dateValue);

  if (isStartDate) {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date.getFullYear() <= 2023 ? null : date;
}

const filterRows = async () => {
  let newStartingDate = processDate(startingDate.value, true);
  let newEndDate = processDate(endDate.value, false);
  let newStartingDate2 = processDate(startingDate2.value, true);
  let newEndDate2 = processDate(endDate2.value, false);
  let newStartingDate3 = processDate(startingDate3.value, true);
  let newEndDate3 = processDate(endDate3.value, false);
  let newStartingDate4 = processDate(startingDate4.value, true);
  let newEndDate4 = processDate(endDate4.value, false);

  //   filteredRows.value = rows.value.slice();
  //   filteredRows.value = rows.value.filter((row) => {
  //     return (
  //       (!selectedCell.value || selectedCell.value.includes(row.cell)) &&
  //       (!selectedFromName.value ||
  //         selectedFromName.value.includes(row.fromName)) &&
  //       ((!selectedProductName.value && row.productName) ||
  //         selectedProductName.value.includes(row.productName)) &&
  //       (!selectedDispatchPVZ.value ||
  //         selectedDispatchPVZ.value.includes(row.dispatchPVZ)) &&
  //       (!selectedOrderPVZ.value ||
  //         selectedOrderPVZ.value.includes(row.orderPVZ)) &&
  //       (!selectedOrderAccount.value ||
  //         selectedOrderAccount.value.includes(row.orderAccount)) &&
  //       (!selectedAdditionally.value ||
  //         selectedAdditionally.value.includes(row.additionally)) &&
  //       (!selectedNotation.value ||
  //         selectedNotation.value.includes(row.notation)) &&
  //       (!selectedPriceSite.value ||
  //         selectedPriceSite.value.includes(row.priceSite.toString())) &&
  //       (!startingDate.value ||
  //         new Date(row.issued) >= new Date(newStartingDate)) &&
  //       (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
  //       (!startingDate2.value ||
  //         new Date(row.deliveredSC) >= new Date(newStartingDate2)) &&
  //       (!endDate2.value || new Date(row.deliveredSC) <= new Date(newEndDate2)) &&
  //       (!startingDate3.value ||
  //         new Date(row.created_at) >= new Date(newStartingDate3)) &&
  //       (!endDate3.value || new Date(row.created_at) <= new Date(newEndDate3)) &&
  //       (!startingDate4.value ||
  //         new Date(row.deliveredPVZ) >= new Date(newStartingDate4)) &&
  //       (!endDate4.value || new Date(row.deliveredPVZ) <= new Date(newEndDate4))
  //     );
  //   });
  isLoading.value = true;
  filteredRows.value = await storeRansom.getRowsFilters(
    selectedCell.value,
    selectedFromName.value,
    selectedDispatchPVZ.value,
    selectedOrderPVZ.value,
    selectedOrderAccount.value,
    selectedNotation.value,
    selectedCreatedUser.value,
    selectedAdditionally.value,
    selectedPriceSite.value,
    newStartingDate,
    newEndDate,
    newStartingDate2,
    newEndDate2,
    newStartingDate3,
    newEndDate3,
    newStartingDate4,
    newEndDate4
  );
  isLoading.value = false;
  emit("filtered-rows", filteredRows.value);
};

function clearFields() {
  selectedCell.value = [];
  selectedAdditionally.value = [];
  selectedDispatchPVZ.value = [];
  selectedOrderPVZ.value = [];
  selectedOrderAccount.value = [];
  selectedFromName.value = [];
  selectedAdditionally.value = [];
  selectedNotation.value = [];
  selectedCreatedUser.value = [];
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  startingDate3.value = "";
  endDate3.value = "";
  startingDate4.value = "";
  endDate4.value = "";
}

const selectedArrays = [
  selectedCell,
  selectedFromName,
  selectedDispatchPVZ,
  selectedOrderPVZ,
  selectedOrderAccount,
  selectedNotation,
  selectedCreatedUser,
  selectedAdditionally,
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
  } else if (startingDate2.value) {
    count++;
  } else if (endDate2.value) {
    count++;
  }

  return count;
});

function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key: string) {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

function saveFiltersToLocalStorage() {
  saveToLocalStorage("selectedCell", selectedCell.value);
  saveToLocalStorage("selectedFromName", selectedFromName.value);
  saveToLocalStorage("selectedDispatchPVZ", selectedDispatchPVZ.value);
  saveToLocalStorage("selectedOrderPVZ", selectedOrderPVZ.value);
  saveToLocalStorage("selectedOrderAccount", selectedOrderAccount.value);
  saveToLocalStorage("selectedNotation", selectedNotation.value);
  saveToLocalStorage("selectedCreatedUser", selectedCreatedUser.value);
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
  const addressData = localStorage.getItem("addressData");
  localStorage.clear();
  if (addressData) {
    localStorage.setItem("addressData", addressData);
  }
  selectedCell.value = [];
  selectedAdditionally.value = [];
  selectedDispatchPVZ.value = [];
  selectedOrderPVZ.value = [];
  selectedOrderAccount.value = [];
  selectedFromName.value = [];
  selectedAdditionally.value = [];
  selectedNotation.value = [];
  selectedCreatedUser.value = [];
  startingDate.value = null;
  endDate.value = null;
  startingDate2.value = null;
  endDate2.value = null;
  startingDate3.value = null;
  endDate3.value = null;
  startingDate4.value = null;
  endDate4.value = null;
}

let dateFilter = ref("issued");
</script>

<template>
  <div class="w-screen px-10 max-sm:px-5 mt-10" v-if="!isLoading">
    <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
      <h1 class="text-xl font-bold">Фильтры</h1>
      <Icon
        @click="showFilters = !showFilters"
        class="cursor-pointer duration-200 hover:text-secondary-color"
        name="material-symbols:settings-rounded"
        size="24"
      />
      <h1
        class="bg-secondary-color px-3 py-1 font-bold text-white rounded-full"
      >
        {{ nonEmptyCount }}
      </h1>
    </div>
    <div
      v-if="showFilters"
      class="border-2 bg-white border-secondary-color border-dashed max-sm:px-3 max-sm:py-1 py-3 px-10 shadow-2xl mt-3"
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
            placeholder="Выберите Ячейка"
          />
        </div>
        <div
          v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
          class="flex items-start space-y-2 flex-col mt-5 text-center"
        >
          <h1>Телефон</h1>
          <VueMultiselect
            v-model="selectedFromName"
            :options="uniqueFromNames"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите Телефон"
          />
        </div>
        <div
          v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
          class="flex items-start space-y-2 flex-col mt-5 text-center"
        >
          <h1>Стоимость сайт</h1>
          <VueMultiselect
            v-model="selectedPriceSite"
            :options="uniquePriceSite"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите Стоимость"
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
        <div
          v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
          class="flex items-start space-y-2 flex-col mt-5 text-center"
        >
          <h1>СЦ</h1>
          <VueMultiselect
            v-model="selectedOrderPVZ"
            :options="uniqueOrderPVZ"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите СЦ"
          />
        </div>
        <div
          v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'"
          class="flex items-start space-y-2 flex-col mt-5 text-center"
        >
          <h1>Аккаунт</h1>
          <VueMultiselect
            v-model="selectedOrderAccount"
            :options="uniqueOrderAccounts"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите Аккаунт"
          />
        </div>
        <div
          v-if="user.additionally1 === 'READ' || user.additionally1 === 'WRITE'"
          class="flex items-start space-y-2 flex-col mt-5 text-center"
        >
          <h1>Дополнительно</h1>
          <VueMultiselect
            v-model="selectedAdditionally"
            :options="uniqueAdditionally"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите Дополнительно"
          />
        </div>
        <div
          v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
          class="flex items-start space-y-2 flex-col mt-5 text-center"
        >
          <h1>Примечание</h1>
          <VueMultiselect
            v-model="selectedNotation"
            :options="uniqueNotation"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите Примечание"
          />
        </div>
        <div class="flex items-start space-y-2 flex-col mt-5 text-center">
          <h1>Создал</h1>
          <VueMultiselect
            v-model="selectedCreatedUser"
            :options="uniqueCreatedUser"
            :multiple="true"
            :close-on-select="true"
            placeholder="Выберите Создал"
          />
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
  <div class="w-screen" v-else>
    <UISpinner />
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
