<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";

const emit = defineEmits(["deleteRow"]);

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  allPVZ: { type: Array as PropType<PVZ[]>, required: true },
  rows: { type: Array as PropType<IDecommissionedEquipmentRow[]>, required: true },
});

async function exportToExcel() {
  perPage.value = await totalRows.value;

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);
  await writeFile(wb, "списанное_оборудование.xlsx");

  perPage.value = await 20000;
}

const perPage = ref(20000);
const currentPage = ref(1);
const totalRows = computed(() =>
  Math.ceil(props.rows.filter((row) => row.deleted === null).length || 0)
);

let returnRows = ref<Array<IDecommissionedEquipmentRow>>([]);
let filteredRows = ref<Array<IDecommissionedEquipmentRow>>([]);

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

const storeUsers = useUsersStore();
let isLoading = ref(false);
let selectedPVZ = ref(111111);

function deleteRow(id: number) {
  emit("deleteRow", id);
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);
</script>

<template>
  <div v-if="!isLoading">
    <div class="flex items-end justify-between mb-5 max-sm:flex-col max-sm:items-start">
      <div>
        <h1 class="text-xl max-sm:text-lg font-bold mb-3 max-sm:mb-0">
          Списанного оборудования:
          <span class="text-secondary-color">{{ totalRows }} шт.</span>
        </h1>
      </div>
      <div class="flex items-end max-sm:mt-2 max-lg:mt-5 max-lg:justify-between gap-20">
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
      v-if="returnRows.length > 0"
    >
      <table
        id="theTable"
        class="w-full border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      >
        <thead
          class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
        >
          <tr>
            <th scope="col" class="px-1 py-2">списано</th>
            <th scope="col" class="px-1 py-2">название</th>
            <th scope="col" class="px-1 py-2">причина</th>
            <th scope="col" class="px-1 py-2">изменил</th>
            <th scope="col" class="px-1 py-2">дата изменения</th>
            <th scope="col" class="px-1 py-2">пвз</th>
            <th scope="col" class="px-1 py-2">списал</th>
            <th scope="col" class="py-2">удаление</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr class="text-center font-bold" v-for="row in returnRows">
            <td class="border-[1px] max-sm:px-2 py-2">
              {{ storeUsers.getNormalizedDate(row.decommissionDate) }}
            </td>
            <td
              class="border-[1px] max-w-[200px]"
            >
              {{ row.equipmentRow.nameOfEquipment }}
            </td>
            <td class="border-[1px] max-sm:px-2 max-w-[200px]">
              {{ row.reason }}
            </td>
            <td class="border-[1px] max-sm:px-2">
              {{ row.equipmentRow.updatedUser.username }}
            </td>
            <td class="border-[1px] max-sm:px-2">
              {{ storeUsers.getNormalizedDate(row.equipmentRow.updated_at) }}
            </td>
            <td class="border-[1px] max-sm:px-2">
              {{ row.equipmentRow.pvz.name }}
            </td>
            <td class="border-[1px] max-sm:px-2">
              {{ row.decommissionedUser.username }}
            </td>
            <td class="border-[1px] max-sm:px-2 py-2">
              <Icon
                name="material-symbols:delete"
                size="24"
                class="text-red-500 cursor-pointer hover:opacity-50 duration-200"
                @click="deleteRow(row.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="flex items-center justify-center flex-col gap-3 mt-10">
      <h1 class="text-2xl">Оборудование не найдено</h1>
      <Icon name="fluent-emoji:sad-but-relieved-face" size="40" />
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
