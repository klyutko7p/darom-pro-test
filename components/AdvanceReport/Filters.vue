<script setup lang="ts">
const props = defineProps({
  rows: { type: Array as PropType<IAdvanceReport[]>, required: true },
  user: { type: Object as PropType<User>, required: true },
});

const storeAdvanceReports = useAdvanceReports();

let showFilters = ref(false);

const selectedPVZ = ref<number | string | null>(null);
const selectedType = ref<number | string | null>(null);
const selectedExpenditure = ref<number | string | null>(null);
const selectedTypeOfExpenditure = ref<number | string | null>(null);
const selectedNotation = ref<number | string | null>(null);
const selectedCompany = ref<number | string | null>(null);
const selectedCreatedUser = ref<number | string | null>(null);
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
  let newStartingDate = new Date(startingDate.value);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(endDate.value);
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
      (!selectedPVZ.value || row.PVZ === selectedPVZ.value) &&
      (!selectedType.value || row.type === selectedType.value) &&
      (!selectedExpenditure.value || row.expenditure === selectedExpenditure.value) &&
      (!selectedTypeOfExpenditure.value ||
        row.typeOfExpenditure === selectedTypeOfExpenditure.value) &&
      (!selectedNotation.value || row.notation === selectedNotation.value) &&
      (!selectedCompany.value || row.company === selectedCompany.value) &&
      (!selectedCreatedUser.value ||
        row.createdUser === selectedCreatedUser.value) &&
      (!selectedIssuedUser.value ||
        row.issuedUser === selectedIssuedUser.value) &&
      (!startingDate.value ||
        new Date(row.date) >= new Date(newStartingDate)) &&
      (!endDate.value || new Date(row.date) <= new Date(newEndDate)) &&
      (!startingDate2.value ||
        new Date(row.received) >= new Date(newStartingDate2)) &&
      (!endDate2.value || new Date(row.received) <= new Date(newEndDate2))
    );
  });
  emit("filtered-rows", filteredRows.value);
};

function clearFields() {
  selectedPVZ.value = "";
  selectedType.value = "";
  selectedExpenditure.value = "";
  selectedTypeOfExpenditure.value = "";
  selectedCompany.value = "";
  selectedNotation.value = "";
  selectedCreatedUser.value = "";
  selectedIssuedUser.value = "";
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
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
    startingDate,
    endDate,
    startingDate2,
    endDate2,
  ],
  filterRows
);

let variables = ref([
  selectedPVZ,
  selectedExpenditure,
  selectedType,
  selectedTypeOfExpenditure,
  selectedCompany,
  selectedCreatedUser,
  selectedIssuedUser,
  startingDate,
  endDate,
  startingDate2,
  endDate2,
]);

const nonEmptyCount: Ref<number> = computed(() => {
  return variables.value.filter((variable: any) => {
    return (
      variable.value !== undefined &&
      variable.value !== null &&
      variable.value !== ""
    );
  }).length;
});

</script>

<template>
  <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
    <h1 class="text-xl font-bold">Фильтры</h1>
    <Icon @click="showFilters = !showFilters" class="cursor-pointer duration-200 hover:text-secondary-color"
      name="solar:filters-line-duotone" size="24" />
    <h1 class="bg-secondary-color px-3 py-1 font-bold text-white rounded-full"> {{ nonEmptyCount }} </h1>
  </div>

  <div
    v-if="showFilters"
    class="border-2 border-gray-300 p-3 mt-3 border-dashed"
  >
    <div class="grid grid-cols-2 max-xl:grid-cols-2 max-md:grid-cols-1">
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Компания:</h1>
        <input
          type="text"
          class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          v-model="selectedCompany"
          list="uniqueCompany"
        />
        <datalist id="uniqueCompany" class="">
          <option v-for="value in uniqueCompany" :value="value">
            {{ value }}
          </option>
        </datalist>
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Показать для ПВЗ:</h1>
        <input
          type="text"
          class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          v-model="selectedPVZ"
          list="uniquePVZ"
        />
        <datalist id="uniquePVZ" class="">
          <option v-for="value in uniquePVZ" :value="value">
            {{ value }}
          </option>
        </datalist>
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Тип:</h1>
        <select class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400" v-model="selectedType">
          <option value="Нал">Нал</option>
          <option value="Безнал">Безнал</option>
        </select>
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Статья расхода:</h1>
        <input
          type="text"
          class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          v-model="selectedTypeOfExpenditure"
          list="uniqueTypeOfExpenditure"
        />
        <datalist id="uniqueTypeOfExpenditure" class="">
          <option v-for="value in uniqueTypeOfExpenditure" :value="value">
            {{ value }}
          </option>
        </datalist>
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Расход:</h1>
        <input
          type="text"
          class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          v-model="selectedExpenditure"
          list="uniqueExpenditure"
        />
        <datalist id="uniqueExpenditure" class="">
          <option v-for="value in uniqueExpenditure" :value="value">
            {{ value }}
          </option>
        </datalist>
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Комментарий:</h1>
        <input
          type="text"
          class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          v-model="selectedNotation"
          list="uniqueNotation"
        />
        <datalist id="uniqueNotation" class="">
          <option v-for="value in uniqueNotation" :value="value">
            {{ value }}
          </option>
        </datalist>
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Создано:</h1>
        <input
          type="text"
          class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          v-model="selectedCreatedUser"
          list="uniqueCreatedUser"
        />
        <datalist id="uniqueCreatedUser" class="">
          <option v-for="value in uniqueCreatedUser" :value="value">
            {{ value }}
          </option>
        </datalist>
      </div>
    </div>
    <div class="flex items-center max-sm:flex-col max-sm:items-start max-sm:gap-5 mt-5">
      <div class="flex items-center gap-3 mr-5">
        <h1 class="max-sm:mr-3">С</h1>
        <input
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          type="date"
          v-model="startingDate"
        />
      </div>
      <div class="flex items-center gap-3 max-sm:mb-7">
        <h1>По</h1>
        <input
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          type="date"
          v-model="endDate"
        />
      </div>
    </div>
    <div class="flex justify-end gap-3 mt-3">
      <UIMainButton @click="filterRows(), showFilters = !showFilters">Принять</UIMainButton>
      <UIActionButton @click="clearFields">Очистить фильтры</UIActionButton>
    </div>
  </div>
</template>
