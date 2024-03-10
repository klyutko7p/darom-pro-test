<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IAdvanceReport>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeAdvanceReports.getAdvancedReports();
  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: "Авансовый отчёт",
});

let isOpen = ref(false);
let rowData = ref({} as IAdvanceReport);

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IAdvanceReport;
}

function openModal(row: IAdvanceReport) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.date = rowData.value.date
      ? storeUsers.getISODateTime(rowData.value.date)
      : null;
    rowData.value.date = rowData.value.date
      ? storeUsers.getISODateTime(rowData.value.date)
      : null;
  } else {
    rowData.value = {} as IAdvanceReport;
  }
}

let pvz = ref([
  "Ряженое",
  "Алексеевка",
  "Латоново",
  "Надежда",
  "Александровка",
  "Новониколаевка",
  "Полтотдельское",
  "Мещерино",
  "ПВЗ1",
  "ПВЗ2",
  "ПВЗ3",
  "ПВЗ4",
  "Офис",
]);

let typesOfExpenditure = ref([
  "Закупка товара",
  "Сопутствующие расходы",
  "Автомобили",
  "Ежемесячные платежи",
  "Оплата ФОТ",
  "Оплата Налоги. ПФР, СОЦ и т.д.",
]);

let companies = ref(["WB start", "Darom.pro", "Сортировка", "Доставка"]);

async function createRow() {
  isLoading.value = true;
  await storeAdvanceReports.createAdvanceReport(rowData.value);
  rows.value = await storeAdvanceReports.getAdvancedReports();
  closeModal();
  isLoading.value = false;
}
async function updateRow() {
  isLoading.value = true;
  await storeAdvanceReports.updateAdvanceReport(rowData.value);
  rows.value = await storeAdvanceReports.getAdvancedReports();
  closeModal();
  isLoading.value = false;
}
</script>

<template>
  <Head>
    <Title>Авансовый отчёт</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <UIMainButton
            v-if="user.role === 'ADMIN' || user.role === 'COURIER'"
            class="mt-24"
            @click="openModal"
          >
            Создание авансового документа
          </UIMainButton>
          <AdvanceReportTable
            :rows="rows"
            :user="user"
            @open-modal="openModal"
          />
        </div>

        <UIModal v-show="isOpen" @close-modal="closeModal">
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение строки с ID - <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Создание нового документа</div>
          </template>
          <div class="text-black">
            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1">ПВЗ</label>
              <select
                class="py-1 px-2 border-2 bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.PVZ"
              >
                <option v-for="pvzData in pvz" :value="pvzData">
                  {{ pvzData }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Дата</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.date"
                type="datetime-local"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Выдано</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.issuedUser"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Расход</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.expenditure"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1"
                >Статья
                расхода</label
              >
              <select
                class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.typeOfExpenditure"
              >
                <option v-for="type in typesOfExpenditure" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Комментарий</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.notation"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1">Компания</label>
              <select
                class="py-1 px-2 border-2 bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.company"
              >
                <option v-for="company in companies" :value="company">
                  {{ company }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name"
                >Подтверждающий <br />
                документ</label
              >
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.notation"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Тип</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.notation"
                type="text"
              />
            </div>
          </div>

          <div
            class="flex items-center justify-center gap-3 mt-10"
            v-if="rowData.id"
          >
            <UIMainButton @click="updateRow">Сохранить</UIMainButton>
            <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
          </div>
          <div class="flex items-center justify-center gap-3 mt-10" v-else>
            <UIMainButton @click="createRow">Создать </UIMainButton>
            <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
          </div>
        </UIModal>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-10">
          <UIMainButton
            v-if="user.role === 'ADMIN' || user.role === 'COURIER'"
            class="mt-24"
            @click="openModal"
          >
            Создание авансового документа
          </UIMainButton>
          <AdvanceReportTable
            :rows="rows"
            :user="user"
            @open-modal="openModal"
          />
        </div>

        <UIModal v-show="isOpen" @close-modal="closeModal">
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение строки с ID - <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Создание нового документа</div>
          </template>
          <div class="text-black">
            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1">ПВЗ</label>
              <select
                class="py-1 px-2 border-2 bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.PVZ"
              >
                <option v-for="pvzData in pvz" :value="pvzData">
                  {{ pvzData }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Дата</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.date"
                type="datetime-local"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Выдано</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.issuedUser"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Расход</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.expenditure"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1"
                >Статья
                расхода</label
              >
              <select
                class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.typeOfExpenditure"
              >
                <option v-for="type in typesOfExpenditure" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Комментарий</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.notation"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1">Компания</label>
              <select
                class="py-1 px-2 border-2 bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.company"
              >
                <option v-for="company in companies" :value="company">
                  {{ company }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name"
                >Подтверждающий <br />
                документ</label
              >
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.notation"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Тип</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.notation"
                type="text"
              />
            </div>
          </div>

          <div
            class="flex items-center justify-center gap-3 mt-10"
            v-if="rowData.id"
          >
            <UIMainButton @click="updateRow">Сохранить</UIMainButton>
            <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
          </div>
          <div class="flex items-center justify-center gap-3 mt-10" v-else>
            <UIMainButton @click="createRow">Создать </UIMainButton>
            <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
          </div>
        </UIModal>
      </NuxtLayout>
    </div>
  </div>

  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
