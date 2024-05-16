<script setup lang="ts">
const props = defineProps({
  rows: { type: Array as PropType<IAdvanceReport[]>, required: true },
  user: { type: Object as PropType<User>, required: true },
});
import VueMultiselect from "vue-multiselect";

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
      (!startingDate.value || new Date(row.date) >= new Date(newStartingDate)) &&
      (!endDate.value || new Date(row.date) <= new Date(newEndDate)) &&
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

const selectedArrays = [
  selectedPVZ,
  selectedExpenditure,
  selectedType,
  selectedTypeOfExpenditure,
  selectedCompany,
  selectedCreatedUser,
  selectedNotation
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
  
  return count;
});

const uniqueType = ref(["Нал", "Безнал"]);
</script>

<template>
  <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
    <h1 class="text-xl font-bold">Фильтры</h1>
    <Icon
      @click="showFilters = !showFilters"
      class="cursor-pointer duration-200 hover:text-secondary-color"
      name="solar:filters-line-duotone"
      size="24"
    />
    <h1 class="bg-secondary-color px-3 py-1 font-bold text-white rounded-full">
      {{ nonEmptyCount }}
    </h1>
  </div>

  <div v-if="showFilters" class="border-2 border-gray-300 p-3 mt-3 border-dashed">
    <div class="grid grid-cols-2 max-xl:grid-cols-2 max-md:grid-cols-1">
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Компания:</h1>
        <VueMultiselect
          v-model="selectedCompany"
          :options="uniqueCompany"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите компанию"
        />
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Показать для ПВЗ:</h1>
        <VueMultiselect
          v-model="selectedPVZ"
          :options="uniquePVZ"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите ПВЗ"
        />
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Тип:</h1>
        <VueMultiselect
          v-model="selectedType"
          :options="uniqueType"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите тип"
        />
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Статья расхода:</h1>
        <VueMultiselect
          v-model="selectedTypeOfExpenditure"
          :options="uniqueTypeOfExpenditure"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите статью"
        />
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Расход:</h1>
        <VueMultiselect
          v-model="selectedExpenditure"
          :options="uniqueExpenditure"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите расход"
        />
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Комментарий:</h1>
        <VueMultiselect
          v-model="selectedNotation"
          :options="uniqueNotation"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите комментарий"
        />
      </div>
      <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
        <h1>Создано:</h1>
        <VueMultiselect
          v-model="selectedCreatedUser"
          :options="uniqueCreatedUser"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите кем"
        />
      </div>
    </div>
    <div class="flex items-center max-sm:flex-col max-sm:items-start max-sm:gap-5 mt-5">
      <div class="flex items-center gap-3 mr-5">
        <h1 class="max-sm:mr-3">С</h1>
        <input
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          type="date"
          placeholder="ДД.ММ.ГГГГ"
          onchange="this.className=(this.value!=''?'has-value':'')"
          v-model="startingDate"
        />
      </div>
      <div class="flex items-center gap-3 max-sm:mb-7">
        <h1>По</h1>
        <input
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
          type="date"
          placeholder="ДД.ММ.ГГГГ"
          onchange="this.className=(this.value!=''?'has-value':'')"
          v-model="endDate"
        />
      </div>
    </div>
    <div class="flex justify-end gap-3 mt-3">
      <UIMainButton @click="filterRows(), (showFilters = !showFilters)"
        >Принять</UIMainButton
      >
      <UIActionButton @click="clearFields">Очистить фильтры</UIActionButton>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
