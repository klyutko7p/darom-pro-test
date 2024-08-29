<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";
import { vAutoAnimate } from "@formkit/auto-animate";
import { useToast } from "vue-toastification";

const toast = useToast();

const emit = defineEmits([
  "updateStateRows",
  "updatePVZRows",
  "updateDecommissionedRows",
]);

async function updateStateRows(flag: string) {
  emit("updateStateRows", {
    idArray: checkedRows.value,
    flag: flag,
  });
  checkedRows.value = [];
  updateCurrentPageData();
}

async function updatePVZRows() {
  emit("updatePVZRows", {
    idArray: checkedRows.value,
    transferPVZ: transferPVZ.value,
  });
  checkedRows.value = [];
}

async function updateDecommissionedRows() {
  emit("updateDecommissionedRows", {
    idArray: checkedRows.value,
  });
  checkedRows.value = [];
  closeMenu();
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  allPVZ: { type: Array as PropType<PVZ[]>, required: true },
  rows: { type: Array as PropType<IEquipmentRow[]>, required: true },
});

async function exportToExcel() {
  perPage.value = await totalRows.value;

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);
  await writeFile(wb, "оборудование.xlsx");

  perPage.value = await 20000;
}

const checkedRows: Ref<number[]> = ref([]);

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

const handleCheckboxChange = (row: IEquipmentRow): void => {
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
  } else {
    checkedRows.value = [];
    checkedRows.value.push(row.id);
    isOpen.value = true;
  }
  if (!checkedRows.value.length) {
    isAllSelected.value = false;
  }
};

const perPage = ref(20000);
const currentPage = ref(1);
const totalRows = computed(() =>
  Math.ceil(props.rows.filter((row) => row.deleted === null).length || 0)
);

let returnRows = ref<Array<IEquipmentRow>>([]);
let filteredRows = ref<Array<IEquipmentRow>>([]);

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  returnRows.value = props.rows.slice(startIndex, endIndex);
  returnRows.value = props.rows.filter((row) => row.deleted === null);

  filteredRows.value = returnRows.value;
}

onMounted(async () => {
  updateCurrentPageData();
});

function filterRows() {
  if (selectedPVZ.value !== 111111) {
    returnRows.value = props.rows.filter(
      (row) => row.pvz.id === selectedPVZ.value && row.deleted === null
    );
  } else {
    returnRows.value = props.rows.filter((row) => row.deleted === null);
  }
}
const storeUsers = useUsersStore();
let isLoading = ref(false);
let selectedPVZ = ref(111111);
let allPVZWithoutStartValue = ref(props.allPVZ.slice(1));
let transferPVZ = ref("");
let isOpen = ref(false);

function closeMenu() {
  isOpen.value = false;
}

const items = [
  {
    label: "Изменить состояние",
    icon: "mdi:state-machine",
    defaultOpen: false,
    slot: "getting-started",
  },
  {
    label: "Переместить",
    icon: "material-symbols:text-select-move-forward-word-outline",
    defaultOpen: false,
    slot: "installation",
  },
];

watch([props.rows, totalRows, props.user], updateCurrentPageData);

const storeEquipments = useEquipmentsStore();
let arrayWithModifiedRows = ref<Array<IEquipmentRow>>([]);
async function getRowByIdFromInput(row: IEquipmentRow) {
  arrayWithModifiedRows.value.push(row);
  arrayWithModifiedRows.value = [...new Set(arrayWithModifiedRows.value)];
  await storeEquipments.updateEquipments(arrayWithModifiedRows.value);
}

let isAllSelected = ref(false);
function handleCheckboxChangeAll() {
  // if (isAllSelected.value) {
  //   let arrayId = props.rows.filter((row) => !row.deleted).map((row) => row.id);
  //   checkedRows.value = arrayId;
  //   isOpen.value = true;
  // } else {
  //   checkedRows.value = [];
  // }
  isAllSelected.value = false;
  toast.warning("Вы не можете выделить все записи");
}
</script>

<template>
  <div v-if="!isLoading">
    <div class="flex items-end justify-between mb-5">
      <div>
        <h1 class="text-xl max-sm:text-lg font-bold mb-3">
          Строк в таблице: <span class="text-secondary-color">{{ totalRows }} шт.</span>
        </h1>
      </div>
      <div class="flex items-end max-lg:mt-5 max-lg:justify-between gap-20">
        <UTooltip
          text="Скачать EXCEL"
          :shortcuts="['xlsx']"
          :popper="{ placement: 'right' }"
        >
          <div
            class="bg-secondary-color cursor-pointer border-2 border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
            @click="exportToExcel"
          >
            <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
          </div>
        </UTooltip>
      </div>
    </div>

    <div
      class="relative max-h-[710px] overflow-y-auto mt-5 mb-10"
      v-if="filteredRows.length > 0"
    >
      <table
        id="theTable"
        class="w-full bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      >
        <thead
          class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
        >
          <tr>
            <th scope="col" class="max-md:px-1 max-xl:px-2">
              <input
                class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[1px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-full bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[1px] ring-secondary-color bg-transparent"
                type="checkbox"
                v-model="isAllSelected"
                @change="handleCheckboxChangeAll()"
              />
            </th>
            <th scope="col" class="py-1 max-xl:px-2">id</th>
            <th scope="col" class="px-1 py-2 max-xl:px-2">пвз</th>
            <th scope="col" class="max-w-[150px]">название</th>
            <th scope="col" class="max-w-[150px]">состояние</th>
            <th scope="col" class="px-1 py-2 max-xl:px-3">изменил</th>
            <th scope="col" class="px-1 max-xl:px-3">дата создания</th>
            <th scope="col" class="px-1 max-xl:px-3">дата изменения</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr
            :class="{
              'bg-orange-100 text-black': isChecked(row.id),
            }"
            class="text-center font-bold"
            v-for="row in filteredRows"
          >
            <td class="text-secondary-color border-[1px]">
              <input
                class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[1px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-full bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[1px] ring-secondary-color"
                type="checkbox"
                :value="row.id"
                :checked="isChecked(row.id)"
                @change="handleCheckboxChange(row)"
              />
            </td>
            <th
              scope="row"
              class="font-bold border-[1px] max-md:px-2 underline text-secondary-color whitespace-nowrap"
            >
              <NuxtLink
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/equipment/record/${row.id}`"
                target="_blank"
              >
                {{ row.id }}
              </NuxtLink>
            </th>
            <td class="border-[1px] max-md:px-2 py-2">
              {{ row.pvz.name }}
            </td>
            <td
              class="border-[1px] px-2 max-w-[150px] max-sm:py-1 max-sm:px-1 max-xl:min-w-[300px]"
            >
              <UTextarea
                autoresize
                :disabled="user.username !== 'Директор'"
                @blur="getRowByIdFromInput(row)"
                :model-value="row.nameOfEquipment"
              />
              <span class="hidden">{{ row.nameOfEquipment }} ₽</span>
            </td>
            <td
              v-if="row.state === 'Исправное'"
              class="max-w-[100px] border-[1px] px-2 max-xl:min-w-[150px] max-lg:min-w-[180px]"
            >
              <h1
                class="mx-auto text-green-500 py-1 rounded-full w-full max-lg:min-w-[150px]"
                :class="{ 'bg-green-100': !isChecked(row.id) }"
              >
                {{ row.state }}
              </h1>
            </td>
            <td
              v-if="row.state === 'Требуется ремонт'"
              class="max-w-[100px] border-[1px] px-2 max-xl:min-w-[150px] max-lg:min-w-[180px]"
            >
              <h1
                class="mx-auto text-yellow-500 py-1 rounded-full w-full max-lg:px-2 max-lg:min-w-[150px]"
                :class="{ 'bg-yellow-100': !isChecked(row.id) }"
              >
                {{ row.state }}
              </h1>
            </td>
            <td
              v-if="row.state === 'Неисправное'"
              class="max-w-[100px] border-[1px] px-2 max-xl:min-w-[150px] max-lg:min-w-[180px]"
            >
              <h1
                class="mx-auto text-red-500 py-1 rounded-full w-full max-lg:min-w-[150px]"
                :class="{ 'bg-red-100': !isChecked(row.id) }"
              >
                {{ row.state }}
              </h1>
            </td>
            <td class="border-[1px] max-md:px-2">
              {{ row.updatedUser.username }}
            </td>
            <td class="border-[1px] max-md:px-2">
              {{ storeUsers.getNormalizedDate(row.created_at) }}
            </td>
            <td class="border-[1px] max-md:px-2">
              {{ storeUsers.getNormalizedDate(row.updated_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="flex items-center justify-center flex-col gap-3 mt-10">
      <h1 class="text-2xl">Оборудование не найдено</h1>
      <Icon name="fluent-emoji:sad-but-relieved-face" size="40" />
    </div>

    <USlideover v-model="isOpen">
      <UCard
        class="flex flex-col flex-1"
        :ui="{
          body: { base: 'flex-1' },
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <Placeholder class="h-8" />
          <h1>Доступные функции</h1>
          <UButton
            color="orange"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark-20-solid"
            class="flex absolute end-5 top-5 z-10"
            square
            padded
            @click="isOpen = false"
          />
        </template>

        <div class="relative max-h-[200px] overflow-y-auto mt-5 mb-10">
          <table
            id="theTable"
            class="w-full bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
          >
            <thead
              class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
            >
              <tr>
                <th scope="col" class="max-md:px-1">
                  <input
                    class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[1px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-full bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[1px] ring-secondary-color"
                    type="checkbox"
                    v-model="isAllSelected"
                    @change="handleCheckboxChangeAll()"
                  />
                </th>
                <th scope="col" class="">пвз</th>
                <th scope="col" class="">название</th>
                <th scope="col" class="">сост.</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                :class="{
                  'bg-orange-100 text-black': isChecked(row.id),
                }"
                class="text-center font-bold"
                v-for="row in returnRows"
              >
                <td class="text-secondary-color border-[1px]">
                  <input
                    class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[1px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-full bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[1px] ring-secondary-color"
                    type="checkbox"
                    :value="row.id"
                    :checked="isChecked(row.id)"
                    @change="handleCheckboxChange(row)"
                  />
                </td>
                <td class="border-[1px] py-1">
                  {{ row.pvz.name }}
                </td>
                <td
                  :title="row.nameOfEquipment"
                  class="border-[1px] overflow-hidden max-w-[100px]"
                >
                  {{ row.nameOfEquipment }}
                </td>
                <td v-if="row.state === 'Исправное'" class="border-[1px]">
                  <h1 class="mx-auto text-green-500">
                    {{ row.state }}
                  </h1>
                </td>
                <td v-if="row.state === 'Требуется ремонт'" class="border-[1px]">
                  <h1 class="mx-auto text-yellow-500">
                    {{ row.state }}
                  </h1>
                </td>
                <td v-if="row.state === 'Неисправное'" class="border-[1px]">
                  <h1 class="mx-auto text-red-500">
                    {{ row.state }}
                  </h1>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <UAccordion color="orange" :items="items">
          <template
            #getting-started
            v-if="
              user.role === 'ADMINISTRATOR' ||
              user.username === 'Волошина' ||
              user.username === 'Шарафаненко' ||
              user.username === 'Горцуева' ||
              user.username === 'Директор' ||
              user.username === 'Власенкова'
            "
          >
            <div
              class="text-gray-900 dark:text-white text-center items-center justify-center bg-[#f8f9fd] py-5 flex flex-col gap-3"
            >
              <UIActionButton2
                :disabled="!checkedRows.length"
                @click="updateStateRows('OK')"
                class="w-full max-w-[300px]"
                >Исправное</UIActionButton2
              >
              <UIActionButton2
                :disabled="!checkedRows.length"
                @click="updateStateRows('RP')"
                class="w-full max-w-[300px]"
                >Требуется ремонт</UIActionButton2
              >
              <UIActionButton2
                :disabled="!checkedRows.length"
                @click="updateStateRows('FT')"
                class="w-full max-w-[300px]"
                >Неисправное</UIActionButton2
              >
            </div>
          </template>

          <template
            #installation
            v-if="
              user.role === 'ADMINISTRATOR' ||
              user.username === 'Волошина' ||
              user.username === 'Шарафаненко' ||
              user.username === 'Горцуева' ||
              user.username === 'Директор' ||
              user.username === 'Власенкова'
            "
          >
            <div
              class="text-gray-900 dark:text-white text-center items-center justify-center bg-[#f8f9fd] py-5 flex flex-col gap-3"
            >
              <USelectMenu
                v-model="transferPVZ"
                :options="allPVZWithoutStartValue"
                @change="filterRows()"
                color="orange"
                placeholder="Выберите ПВЗ"
                x
                class="z-[50] w-40 bg-white"
              />
              <UIActionButton2
                :disabled="!transferPVZ"
                @click="updatePVZRows()"
                class="w-full max-w-[300px]"
                >Переместить</UIActionButton2
              >
            </div>
          </template>
        </UAccordion>

        <div
          v-if="checkedRows.length && user.username === 'Директор'"
          @click="updateDecommissionedRows()"
          class="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium rounded-full-md text-sm gap-x-1.5 px-2.5 py-1.5 text-orange-500 dark:text-orange-400 bg-orange-50 hover:bg-orange-100 disabled:bg-orange-50 dark:bg-orange-950 dark:hover:bg-orange-900 dark:disabled:bg-orange-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 inline-flex items-center mb-1.5 w-full cursor-pointer duration-100"
        >
          <Icon name="material-symbols:cancel-schedule-send" size="20" />
          <h1 class="text-sm">Списать</h1>
        </div>

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
    </USlideover>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
