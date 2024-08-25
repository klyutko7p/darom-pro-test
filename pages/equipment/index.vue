<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const storeUsers = useUsersStore();
const storeEquipments = useEquipmentsStore();
const storePVZ = usePVZStore();
const router = useRouter();
const token = Cookies.get("token");

let isLoading = ref(false);
let user = ref({} as User);
let rows = ref<Array<IEquipmentRow>>([]);
let allPVZ = ref<Array<PVZ>>([]);
let allStateEquipments = ref<Array<string>>([]);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  try {
    user.value = await storeUsers.getUser();
    allStateEquipments.value = storeEquipments.getAllStateEquipments();

    const [rowsData, allPVZData] = await Promise.all([
      storeEquipments.getEquipments(),
      storePVZ.getPVZ(),
    ]);

    rows.value = rowsData;

    if (rows.value) {
      handleFilteredRows(rows.value);
    }

    allPVZ.value = allPVZData;
    if (!allPVZ.value.some((pvz) => pvz.id === 111111)) {
      allPVZ.value.unshift({ id: 111111, name: "Все ПВЗ" });
    }
    allPVZ.value = allPVZ.value.filter((pvz) => pvz.name !== "НаДом");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    isLoading.value = false;
  }
});

definePageMeta({
  layout: false,
  name: "Оборудование ПВЗ",
});

let equipmentRowData = ref({} as IEquipmentRow);

let isOpen = ref(false);
function openModal(row: IEquipmentRow) {
  isOpen.value = true;
  if (row.id) {
    equipmentRowData.value = JSON.parse(JSON.stringify(row));
    equipmentRowData.value.updatedUserId = user.value.id;
  } else {
    equipmentRowData.value = {} as IEquipmentRow;
    equipmentRowData.value.state = "Исправное";
    equipmentRowData.value.updatedUserId = user.value.id;
  }
}

function closeModal() {
  isOpen.value = false;
  equipmentRowData.value = {} as IEquipmentRow;
}

function lockScroll() {
  document.body.classList.add("no-scroll");
}

function unlockScroll() {
  document.body.classList.remove("no-scroll");
}

watch(isOpen, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

const validationRules = [
  {
    field: "nameOfEquipment",
    message: "Название оборудования не может быть пустым",
    validate: (value: any) => !!value,
  },
  {
    field: "state",
    message: "Выберите состояние оборудования",
    validate: (value: any) => !!value,
  },
  {
    field: "pvzId",
    message: "Выберите ПВЗ",
    validate: (value: any) => !!value,
  },
];

const storeFunctions = useFunctionsStore();

async function createEquipmentRow() {
  let isValid = storeFunctions.checkValidation(equipmentRowData.value, validationRules);
  if (isValid) {
    isLoading.value = true;
    await storeEquipments.createEquipment(equipmentRowData.value);
    rows.value = await storeEquipments.getEquipments();
    closeModal();
    isLoading.value = false;
  }
}

async function updateEquipmentRow() {
  let isValid = storeFunctions.checkValidation(equipmentRowData.value, validationRules);
  if (isValid) {
    isLoading.value = true;
    await storeEquipments.updateEquipment(equipmentRowData.value);
    rows.value = await storeEquipments.getEquipments();
    closeModal();
    isLoading.value = false;
  }
}

async function updateStateRows(obj: any) {
  let answer = confirm(
    `Вы точно хотите изменить статус состояния? Количество записей: ${obj.idArray.length}`
  );
  if (answer) {
    isLoading.value = true;
    await storeEquipments.updateStateRows(obj.idArray, obj.flag, user.value.id);
    rows.value = await storeEquipments.getEquipments();
    isLoading.value = false;
  }
}

async function updatePVZRows(obj: any) {
  let answer = confirm(
    `Вы точно хотите переместить на другое ПВЗ? Количество записей: ${obj.idArray.length}`
  );
  if (answer) {
    isLoading.value = true;
    await storeEquipments.updatePVZRows(obj.idArray, obj.transferPVZ, user.value.id);
    rows.value = await storeEquipments.getEquipments();
    isLoading.value = false;
  }
}

let reason = ref("");
let isOpenModalReason = ref(false);

function closeModalReason() {
  isOpenModalReason.value = false;
  reason.value = "";
  copyOfObject.value = {};
}

let copyOfObject = ref({} as any);

async function updateDecommissionedRowsAccept() {
  isLoading.value = true;
  await storeEquipments.updateDecommissionedRows(
    copyOfObject.value.idArray,
    reason.value,
    user.value.id
  );
  rows.value = await storeEquipments.getEquipments();
  isLoading.value = false;
  closeModalReason();
}

function updateDecommissionedRows(obj: any) {
  copyOfObject.value = obj;
  isOpenModalReason.value = true;
}

const filteredRows = ref<Array<IEquipmentRow>>([]);
function handleFilteredRows(filteredRowsData: IEquipmentRow[]) {
  filteredRows.value = filteredRowsData;
}
</script>

<template>
  <Head>
    <Title>Оборудование ПВЗ</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <div class="flex items-center justify-between">
            <UIMainButton @click="openModal">Создать строку</UIMainButton>
            <NuxtLink
              v-if="user.username === 'Директор'"
              to="/equipment/decommissioned"
              class="bg-orange-500 px-5 py-2 text-white rounded-full text-secondary-color font-bold text-base hover:opacity-50 duration-200"
              >Показать списанное</NuxtLink
            >
          </div>

          <div class="bg-[#f8f9fd] px-5 pt-3 mt-10 pb-5 space-y-10">
            <EquipmentFilters
              v-if="rows"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
              :user="user"
            />

            <EquipmentTable
              @updateStateRows="updateStateRows"
              @updatePVZRows="updatePVZRows"
              @updateDecommissionedRows="updateDecommissionedRows"
              :user="user"
              :rows="filteredRows"
              :allPVZ="allPVZ"
            />
          </div>

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon size="24" name="material-symbols:perm-data-setting-outline-rounded" />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="equipmentRowData.id">
                <h1>Изменение: {{ equipmentRowData.nameOfEquipment }}</h1>
              </div>
              <div class="custom-header" v-else>
                <h1>Создание строки</h1>
              </div>
            </template>
            <template v-slot:body>
              <div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="pvzId">ПВЗ</label>
                  <USelectMenu
                    v-model="equipmentRowData.pvzId"
                    :options="allPVZ.slice(1)"
                    color="orange"
                    value-attribute="id"
                    option-attribute="name"
                    class="z-[100] w-full bg-white"
                  />
                </div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="nameOfEquipment">Название</label>
                  <textarea
                    required
                    class="block w-full ring-1 ring-gray-200 focus:ring-[1px] focus:ring-orange-400 bg-transparent rounded-md py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none border-[1px] border-orange-400"
                    v-model="equipmentRowData.nameOfEquipment"
                    type="text"
                  />
                </div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="state">Состояние оборудования</label>
                  <USelectMenu
                    v-model="equipmentRowData.state"
                    :options="allStateEquipments"
                    color="orange"
                    class="z-[90] w-full bg-white"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex gap-3 items-center justify-center"
                v-if="equipmentRowData.id"
              >
                <UISaveModalButton @click="updateEquipmentRow"
                  >СОХРАНИТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
              </div>
              <div class="flex gap-3 items-center justify-center" v-else>
                <UISaveModalButton @click="createEquipmentRow">СОЗДАТЬ</UISaveModalButton>
                <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit v-show="isOpenModalReason" @close-modal="closeModalReason">
            <template v-slot:header>
              <div class="custom-header">
                <h1>Списание оборудования</h1>
              </div>
            </template>
            <template v-slot:body>
              <div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="reason">Причина списания</label>
                  <input
                    required
                    class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-black bg-transparent rounded-md py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none border-[1px] border-black"
                    v-model="reason"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div class="flex gap-3 items-center justify-center">
                <UISaveModalButton @click="updateDecommissionedRowsAccept"
                  >СПИСАТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModalReason">ЗАКРЫТЬ</UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-10">
          <div class="flex items-center justify-between">
            <UIMainButton @click="openModal">Создать строку</UIMainButton>
          </div>

          <EquipmentFilters
            v-if="rows"
            @filtered-rows="handleFilteredRows"
            :rows="rows"
            :user="user"
          />

          <EquipmentTable
            @updateStateRows="updateStateRows"
            @updatePVZRows="updatePVZRows"
            @updateDecommissionedRows="updateDecommissionedRows"
            :user="user"
            :rows="filteredRows"
            :allPVZ="allPVZ"
          />

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon size="24" name="material-symbols:perm-data-setting-outline-rounded" />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="equipmentRowData.id">
                <h1>Изменение: {{ equipmentRowData.nameOfEquipment }}</h1>
              </div>
              <div class="custom-header" v-else>
                <h1>Создание строки</h1>
              </div>
            </template>
            <template v-slot:body>
              <div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="pvzId">ПВЗ</label>
                  <USelectMenu
                    v-model="equipmentRowData.pvzId"
                    :options="allPVZ.slice(1)"
                    color="orange"
                    value-attribute="id"
                    option-attribute="name"
                    class="z-[100] w-full bg-white"
                  />
                </div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="nameOfEquipment">Название</label>
                  <textarea
                    required
                    class="block w-full ring-1 ring-gray-200 focus:ring-[1px] focus:ring-orange-400 bg-transparent rounded-md py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none border-[1px] border-orange-400"
                    v-model="equipmentRowData.nameOfEquipment"
                    type="text"
                  />
                </div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="state">Состояние оборудования</label>
                  <USelectMenu
                    v-model="equipmentRowData.state"
                    :options="allStateEquipments"
                    color="orange"
                    class="z-[90] w-full bg-white"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex gap-3 items-center justify-center"
                v-if="equipmentRowData.id"
              >
                <UISaveModalButton @click="updateEquipmentRow"
                  >СОХРАНИТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
              </div>
              <div class="flex gap-3 items-center justify-center" v-else>
                <UISaveModalButton @click="createEquipmentRow">СОЗДАТЬ</UISaveModalButton>
                <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit v-show="isOpenModalReason" @close-modal="closeModalReason">
            <template v-slot:header>
              <div class="custom-header">
                <h1>Списание оборудования</h1>
              </div>
            </template>
            <template v-slot:body>
              <div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="reason">Причина списания</label>
                  <input
                    required
                    class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-black bg-transparent rounded-md py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none border-[1px] border-black"
                    v-model="reason"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div class="flex gap-3 items-center justify-center">
                <UISaveModalButton @click="updateDecommissionedRowsAccept"
                  >СПИСАТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModalReason">ЗАКРЫТЬ</UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>
        </div>
      </NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
