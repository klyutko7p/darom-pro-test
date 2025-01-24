<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const storeUsers = useUsersStore();
const storeAutos = useAutosStore();
const storePVZ = usePVZStore();
const router = useRouter();
const token = Cookies.get("token");

let isLoading = ref(false);
let user = ref({} as User);
let users = ref<Array<User>>([]);
let rows = ref<Array<AutoRow>>([]);
let allAutoTypes = ref<Array<AutoType>>([]);
let allStateAutos = ref<Array<string>>([]);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;

  try {
    const [currentUser, autoStates, autos, autoTypes, usersList] =
      await Promise.all([
        await storeUsers.getUser(),
        storeAutos.getAllStateAutos(),
        storeAutos.getAutos(),
        storeAutos.getAutoTypes(),
        storeUsers.getUsers(),
      ]);

    user.value = currentUser;
    allStateAutos.value = autoStates;
    rows.value = autos;
    users.value = usersList;
    allAutoTypes.value = autoTypes;

    if (rows.value) {
      handleFilteredRows(rows.value);
    }
  } catch (error) {
    console.error("An error occurred while loading data:", error);
  } finally {
    isLoading.value = false;
  }
});

definePageMeta({
  layout: false,
  name: "АвтоСклад",
});

let autoRowData = ref({} as AutoRow);

let isOpen = ref(false);

function openModal(row: AutoRow) {
  isOpen.value = true;
  if (row.id) {
    autoRowData.value = JSON.parse(JSON.stringify(row));
    autoRowData.value.updatedUserId = user.value.id;
  } else {
    autoRowData.value = {} as AutoRow;
    autoRowData.value.state = "На складе";
    autoRowData.value.updatedUserId = user.value.id;
  }
}

function closeModal() {
  isOpen.value = false;
  autoRowData.value = {} as AutoRow;
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
    field: "state",
    message: "Выберите состояние оборудования",
    validate: (value: any) => !!value,
  },
  {
    field: "nameOfEquipment",
    message: "Впишите название оборудования",
    validate: (value: any) => !!value,
  },
  {
    field: "autoTypeId",
    message: "Выберите автомобиль",
    validate: (value: any) => !!value,
  },
];

const storeFunctions = useFunctionsStore();

async function createAutoRow() {
  let isValid = storeFunctions.checkValidation(
    autoRowData.value,
    validationRules
  );
  if (isValid) {
    isLoading.value = true;
    await storeAutos.createAuto(autoRowData.value);
    rows.value = await storeAutos.getAutos();
    closeModal();
    if (rows.value) {
      handleFilteredRows(rows.value);
    }
    isLoading.value = false;
  }
}

async function updateAutoRow() {
  let isValid = storeFunctions.checkValidation(
    autoRowData.value,
    validationRules
  );
  if (isValid) {
    isLoading.value = true;
    await storeAutos.updateAuto(autoRowData.value);
    rows.value = await storeAutos.getAutos();
    closeModal();
    if (rows.value) {
      handleFilteredRows(rows.value);
    }
    isLoading.value = false;
  }
}

async function updateStateRows(obj: any) {
  let answer = confirm(
    `Вы точно хотите изменить статус состояния? Количество записей: ${obj.idArray.length}`
  );
  if (answer) {
    isLoading.value = true;

    await storeAutos.updateStateRows(obj.idArray, obj.flag, user.value.id);
    rows.value = await storeAutos.getAutos();
    if (rows.value) {
      handleFilteredRows(rows.value);
    }
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
  await storeAutos.updateDecommissionedRows(
    copyOfObject.value.idArray,
    reason.value,
    user.value.id
  );
  rows.value = await storeAutos.getAutos();
  if (rows.value) {
    handleFilteredRows(rows.value);
  }
  isLoading.value = false;
  closeModalReason();
}

function updateDecommissionedRows(obj: any) {
  copyOfObject.value = obj;
  isOpenModalReason.value = true;
}

const filteredRows = ref<Array<AutoRow>>([]);
function handleFilteredRows(filteredRowsData: AutoRow[]) {
  filteredRows.value = filteredRowsData;
}
</script>

<template>
  <Head>
    <Title>АвтоСклад</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
          <div
            class="flex items-center justify-between max-sm:gap-2 max-[400px]:items-start mb-10"
          >
            <UIMainButton class="mb-5" @click="openModal"
              >Создать строку</UIMainButton
            >
            <NuxtLink
              v-if="
                user.username === 'Директор' || user.username === 'Власенкова'
              "
              to="/auto-storage/decommissioned"
              class="bg-orange-500 text-sm pt-1.5 pb-0.5 px-2 text-white rounded-full text-secondary-color font-semibold hover:opacity-50 duration-200"
            >
              <Icon size="24" name="hugeicons:group-items" />
            </NuxtLink>
          </div>

          <div>
            <AutoFilters
              v-if="rows"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
              :user="user"
            />

            <AutoTable
              @updateStateRows="updateStateRows"
              @updateDecommissionedRows="updateDecommissionedRows"
              :user="user"
              :rows="filteredRows"
              :allAutoTypes="allAutoTypes"
            />
          </div>

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols:perm-data-setting-outline-rounded"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="autoRowData.id">
                <h1>Изменение: {{ autoRowData.id }}</h1>
              </div>
              <div class="custom-header" v-else>
                <h1>Создание строки</h1>
              </div>
            </template>
            <template v-slot:body>
              <div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="pvzId">Автомобиль</label>
                  <USelectMenu
                    v-model="autoRowData.autoTypeId"
                    :options="allAutoTypes"
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
                    class="block w-full ring-1 ring-gray-200 focus:ring-[2px] focus:ring-orange-400 bg-transparent rounded-md py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none border-[1px] border-orange-400"
                    v-model="autoRowData.nameOfEquipment"
                    type="text"
                  />
                </div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="state">Состояние оборудования</label>
                  <USelectMenu
                    v-model="autoRowData.state"
                    :options="allStateAutos"
                    color="orange"
                    class="z-[90] w-full bg-white"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex gap-3 items-center justify-center"
                v-if="autoRowData.id"
              >
                <UISaveModalButton @click="updateAutoRow"
                  >СОХРАНИТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModal"
                  >ЗАКРЫТЬ</UIExitModalButton
                >
              </div>
              <div class="flex gap-3 items-center justify-center" v-else>
                <UISaveModalButton @click="createAutoRow"
                  >СОЗДАТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModal"
                  >ЗАКРЫТЬ</UIExitModalButton
                >
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit
            v-show="isOpenModalReason"
            @close-modal="closeModalReason"
          >
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
                <UIExitModalButton @click="closeModalReason"
                  >ЗАКРЫТЬ</UIExitModalButton
                >
              </div>
            </template>
          </UINewModalEdit>
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
          <div
            class="flex items-center justify-between max-sm:gap-2 max-[400px]:items-start"
          >
            <UIMainButton class="mb-5" @click="openModal"
              >Создать строку</UIMainButton
            >
            <NuxtLink
              v-if="
                user.username === 'Директор' || user.username === 'Власенкова'
              "
              to="/auto-storage/decommissioned"
              class="bg-orange-500 text-sm pt-1.5 pb-0.5 px-2 text-white rounded-full text-secondary-color font-semibold hover:opacity-50 duration-200"
            >
              <Icon size="32" name="hugeicons:group-items" />
            </NuxtLink>
          </div>

          <div>
            <AutoFilters
              v-if="rows"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
              :user="user"
            />

            <AutoTable
              @updateStateRows="updateStateRows"
              @updateDecommissionedRows="updateDecommissionedRows"
              :user="user"
              :rows="filteredRows"
              :allAutoTypes="allAutoTypes"
            />
          </div>

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols:perm-data-setting-outline-rounded"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="autoRowData.id">
                <h1>Изменение: {{ autoRowData.id }}</h1>
              </div>
              <div class="custom-header" v-else>
                <h1>Создание строки</h1>
              </div>
            </template>
            <template v-slot:body>
              <div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="pvzId">Автомобиль</label>
                  <USelectMenu
                    v-model="autoRowData.autoTypeId"
                    :options="allAutoTypes"
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
                    class="block w-full ring-1 ring-gray-200 focus:ring-[2px] focus:ring-orange-400 bg-transparent rounded-md py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none border-[1px] border-orange-400"
                    v-model="autoRowData.nameOfEquipment"
                    type="text"
                  />
                </div>
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="state">Состояние оборудования</label>
                  <USelectMenu
                    v-model="autoRowData.state"
                    :options="allStateAutos"
                    color="orange"
                    class="z-[90] w-full bg-white"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex gap-3 items-center justify-center"
                v-if="autoRowData.id"
              >
                <UISaveModalButton @click="updateAutoRow"
                  >СОХРАНИТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModal"
                  >ЗАКРЫТЬ</UIExitModalButton
                >
              </div>
              <div class="flex gap-3 items-center justify-center" v-else>
                <UISaveModalButton @click="createAutoRow"
                  >СОЗДАТЬ</UISaveModalButton
                >
                <UIExitModalButton @click="closeModal"
                  >ЗАКРЫТЬ</UIExitModalButton
                >
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit
            v-show="isOpenModalReason"
            @close-modal="closeModalReason"
          >
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
                <UIExitModalButton @click="closeModalReason"
                  >ЗАКРЫТЬ</UIExitModalButton
                >
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
