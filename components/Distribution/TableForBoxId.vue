<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";
import { createClient } from "@supabase/supabase-js";
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const router = useRouter();
const route = useRoute();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storeQR = useQRStore();
const storeBalance = useBalanceStore();

const emit = defineEmits(["deleteRow", "deleteSelectedRows"]);

function deleteRow(id: number) {
  emit("deleteRow", id);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  idRows: { type: Array as PropType<number[]>, required: true },
});

let returnRows = ref<Array<IOurRansom>>([]);

const totalRows = computed(() => Math.ceil(props.idRows?.length || 0));

async function updateCurrentPageData() {
  isLoading.value = true;
  let ourRansomRows = await storeRansom.getRansomRowsByIds(props.idRows);
  returnRows.value = ourRansomRows;
  isLoading.value = false;
}

watch([totalRows, props.idRows, returnRows.value], updateCurrentPageData);
onMounted(async () => {
  isLoading.value = true;

  await updateCurrentPageData();
  isLoading.value = false;
});

const itemsTable = (row: IOurRansom) => [
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteRow(row.id),
    },
  ],
];

let isLoading = ref(false);

const columns = [
  {
    key: "actions",
  },
  {
    key: "id",
    label: "ID",
  },
  {
    key: "productName",
    label: "Название товара",
  },
  {
    key: "notation",
    label: "Примечание",
  },
  {
    key: "dispatchPVZ",
    label: "ПВЗ",
  },
  {
    key: "deliveredSC",
    label: "Доставлено на СЦ",
  },
  {
    key: "quantity",
    label: "Количество",
  },
];

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};
</script>

<template>
  <div v-if="!isLoading">
    <div>
      <UTable
        class="w-full z-[20] mx-auto text-center rounded-md my-3"
        :ui="{ wrapper: 'relative bg-white',
  td: {
    base: 'border-[1px] text-center whitespace-normal',
    padding: 'px-3 py-1',
  },
  th: {
    base: 'text-center uppercase border-[1px] sticky top-0 z-[20] bg-white',
    padding: 'px-1',
    size: 'text-xs'
  },
  default:
  {
    checkbox:
      { color: 'gray' as any }
  },
    }"
        :rows="returnRows"
        :columns="columns"
      >
        <template #id-data="{ row }">
          <NuxtLink
            v-if="
              user.role !== 'PVZ' &&
              user.role !== 'ADMINISTRATOR' &&
              user.role !== 'RMANAGER' &&
              user.role !== 'PPVZ'
            "
            class="cursor-pointer text-secondary-color hover:opacity-50 duration-200 font-semibold"
            :to="`/spreadsheets/record/1/${row.id}`"
          >
            {{ row.id }}
          </NuxtLink>
          <h1 v-else>{{ row.id }}</h1>
        </template>

        <template #productName-data="{ row }">
          <p class="min-w-[200px]">
            {{ row.productName }}
          </p>
        </template>

        <template #notation-data="{ row }">
          <p
            :class="{
              'bg-yellow-300 text-white font-semibold px-1': row.notation,
            }"
          >
            {{ row.notation ? row.notation : "Пусто" }}
          </p>
        </template>

        <template #dispatchPVZ-data="{ row }">
          <p
            v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'"
          >
            {{ row.dispatchPVZ }}
          </p>
        </template>

        <template #deliveredSC-data="{ row }">
          <p
            v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'"
            class="font-bold text-green-500"
          >
            {{
              row.deliveredSC
                ? storeUsers.getNormalizedDate(row.deliveredSC)
                : ""
            }}
          </p>
        </template>

        <template #quantity-data="{ row }">
          <p>
            {{ idRows.filter((id) => id === row.id).length }}
          </p>
        </template>

        <template
          v-if="
            user.username === 'Директор' ||
            user.username === 'Власенкова' ||
            user.username === 'Горцуева'
          "
          #actions-data="{ row }"
        >
          <UDropdown :open="dropdownStates[row.id]" :items="itemsTable(row)">
            <UButton
              variant="ghost"
              color="gray"
              class="text-sm duration-200"
              @touchstart.stop="toggleDropdown(row.id)"
            >
              ...
            </UButton>
          </UDropdown>
        </template>
      </UTable>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinnerModal />
      <h1 class="text-center italic">Идёт загрузка данных...</h1>
    </NuxtLayout>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

.path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  &.circle {
    -webkit-animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
    animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
  }
  &.line {
    stroke-dashoffset: 1000;
    -webkit-animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
  &.check {
    stroke-dashoffset: -100;
    -webkit-animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
}

@-webkit-keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@-webkit-keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}

@keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}
</style>
