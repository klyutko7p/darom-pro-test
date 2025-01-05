<script setup lang="ts">
import Cookies from "js-cookie";
import { usePVZStore } from "../../stores/pvz";

const storeUsers = useUsersStore();
const storePVZ = usePVZStore();
const router = useRouter();

let allPVZ = ref<Array<PVZ>>([]);
const rows = ref<Array<IPVZPercent>>([
  {
    id: 1,
    pvzId: 1,
    pvz: { id: 1, name: "ПВЗ_1" },
    wb: 0,
    ozon: 0,
    ym: 0,
    flag: "OurRansom",
  },
  {
    id: 2,
    pvzId: 2,
    pvz: { id: 2, name: "ПВЗ_2" },
    wb: 0,
    ozon: 0,
    ym: 0,
    flag: "OurRansom",
  },
  {
    id: 3,
    pvzId: 1,
    pvz: { id: 1, name: "ПВЗ_1" },
    wb: 0,
    ozon: 0,
    ym: 0,
    flag: "ClientRansom",
  },
  {
    id: 4,
    pvzId: 2,
    pvz: { id: 2, name: "ПВЗ_2" },
    wb: 0,
    ozon: 0,
    ym: 0,
    flag: "ClientRansom",
  },
]);

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;

  try {
    const [currentUser, pvzList] = await Promise.all([
      await storeUsers.getUser(),
      storePVZ.getPVZ(),
    ]);

    user.value = currentUser;
    // rows.value = equipments;

    allPVZ.value = preparePVZList(pvzList);
  } catch (error) {
    console.error("An error occurred while loading data:", error);
  } finally {
    isLoading.value = false;
  }
});

function preparePVZList(pvzList: PVZ[]): PVZ[] {
  const updatedPVZList = [...pvzList];

  return updatedPVZList.filter((pvz) => pvz.name !== "НаДом");
}

definePageMeta({
  layout: false,
});

let rowData = ref({} as IPVZPercent);
let isOpen = ref(false);

function openModal() {
  isOpen.value = true;
  rowData.value = {} as IPVZPercent;
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IPVZPercent;
}

async function createPVZPercentRow() {
  isLoading.value = true;
  // await storeEquipments.createEquipment(equipmentRowData.value);
  // rows.value = await storeEquipments.getEquipments();
  // closeModal();
  // if (rows.value) {
  //   handleFilteredRows(rows.value);
  // }
  isLoading.value = false;
}

const flags = [
  { flag: "OurRansom", name: "Доставка с оформлением заказа" },
  { flag: "ClientRansom", name: "Доставка по Штрих-коду (QR)" },
];
</script>

<template>
  <Head>
    <Title>Процент ПВЗ</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading" class="bg-gray-50 px-5 pt-10 max-sm:px-1 pb-5">
        <UIMainButton class="mb-5" @click="openModal"
          >Создать строку</UIMainButton
        >

        <h1 class="mt-5 text-xl max-[330px]:text-lg mb-5">
          <span
            class="flex items-center gap-3 max-sm:flex-col max-sm:gap-0 max-sm:items-start mb-1"
          >
            <Icon
              class="text-orange-500"
              name="solar:box-bold-duotone"
              size="32"
            />
            Доставка с оформлением заказа
          </span>
        </h1>
        <AdminDataPercentTable
          :user="user"
          :rows="rows.filter((row) => row.flag === 'OurRansom')"
        />

        <h1 class="mt-20 text-xl max-[330px]:text-lg mb-5">
          <span
            class="flex items-center gap-3 max-sm:flex-col max-sm:gap-0 max-sm:items-start mb-1"
          >
            <Icon
              name="mdi:truck-fast"
              class="text-secondary-color"
              size="32"
            />
            Доставка по Штрих-коду (QR)
          </span>
        </h1>
        <AdminDataPercentTable
          :user="user"
          :rows="rows.filter((row) => row.flag === 'ClientRansom')"
        />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon
              size="24"
              name="material-symbols:perm-data-setting-outline-rounded"
            />
          </template>
          <template v-slot:header>
            <div class="custom-header">
              <h1>Создание строки</h1>
            </div>
          </template>
          <template v-slot:body>
            <div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="pvzId">ПВЗ</label>
                <USelectMenu
                  v-model="rowData.pvzId"
                  :options="allPVZ"
                  value-attribute="id"
                  option-attribute="name"
                  class="z-[100] w-full bg-white"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="nameOfEquipment">% Wildberries</label>
                <UInput
                  required
                  class="w-full"
                  v-model="rowData.wb"
                  type="number"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="nameOfEquipment">% Ozon</label>
                <UInput
                  required
                  class="w-full"
                  v-model="rowData.ozon"
                  type="number"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="nameOfEquipment">% Яндекс Маркет</label>
                <UInput
                  required
                  class="w-full"
                  v-model="rowData.ym"
                  type="number"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="nameOfEquipment">Тип</label>
                <USelectMenu
                  v-model="rowData.flag"
                  :options="flags"
                  value-attribute="flag"
                  option-attribute="name"
                  class="z-[100] w-full min-w-[265px] bg-white"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="createPVZPercentRow"
                >СОЗДАТЬ</UISaveModalButton
              >
              <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-else-if="user.role === 'USER'">
    <NuxtLayout name="user">
      <h1>
        У вас недостаточно прав на просмотр этой информации. Обратитесь к
        администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
