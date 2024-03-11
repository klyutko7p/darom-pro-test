<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storeBalance = useBalanceStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IAdvanceReport>>();
let rowsBalance = ref<Array<IBalance>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeAdvanceReports.getAdvancedReports();

  rows.value = rows.value?.filter(
    (row) => row.createdUser === user.value.username || row.issuedUser === user.value.username
  );

  ourRansomRows.value = await storeRansom.getRansomRowsForBalance("OurRansom");
  clientRansomRows.value = await storeRansom.getRansomRowsForBalance(
    "ClientRansom"
  );
  rowsBalance.value = await storeBalance.getBalanceRows();

  getAllSum();

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
let sum1 = ref(0);
let sum2 = ref(0);
let allSum = ref(0);
let sumOfReject = ref(200);

function calculateValue(curValue: any) {
  if (!curValue.prepayment) {
    return curValue.additionally !== "Отказ клиент"
      ? Math.ceil(curValue.amountFromClient1 / 10) * 10 -
          curValue.priceSite +
          curValue.deliveredKGT
      : sumOfReject.value;
  } else {
    return curValue.additionally !== "Отказ клиент"
      ? (curValue.priceSite * curValue.percentClient) / 100 +
          curValue.deliveredKGT
      : sumOfReject.value;
  }
}

function reduceArray(array: any, flag: string) {
  if (flag === "OurRansom") {
    array = array.filter((row: any) => row.additionally !== "Отказ брак");
    return array.reduce(
      (ac: any, curValue: any) =>
        ac + Math.ceil(curValue.amountFromClient1 / 10) * 10,
      0
    );
  } else if (flag === "ClientRansom") {
    array = array.filter((row: any) => row.additionally !== "Отказ брак");
    return array.reduce(
      (ac: any, curValue: any) => ac + curValue.amountFromClient2,
      0
    );
  } else {
    array = array.filter((row: any) => row.additionally !== "Отказ брак");
    return array.reduce(
      (ac: any, curValue: any) => ac + curValue.amountFromClient3,
      0
    );
  }
}

let copyArrayOurRansom = ref<Array<IOurRansom>>();
let copyArrayClientRansom = ref<Array<IClientRansom>>();
let ourRansomRows = ref<Array<IOurRansom>>();
let clientRansomRows = ref<Array<IClientRansom>>();

function getAllSum() {
  // let newStartingDate = new Date(startingDate.value);
  // newStartingDate.setHours(0);
  // newStartingDate.setMinutes(0);
  // newStartingDate.setSeconds(0);
  // newStartingDate.setMilliseconds(0);

  // let newEndDate = new Date(endDate.value);
  // newEndDate.setHours(23);
  // newEndDate.setMinutes(59);
  // newEndDate.setSeconds(59);
  // newEndDate.setMilliseconds(0);

  copyArrayOurRansom.value = ourRansomRows.value?.filter(
    (row) =>
      row.issued !== null &&
      (row.additionally === "Оплата наличными" ||
        row.additionally === "Отказ клиент")
  );

  copyArrayClientRansom.value = clientRansomRows.value?.filter(
    (row) => row.issued !== null && row.additionally === "Оплата наличными"
  );

  let sumOfPVZ = rowsBalance.value
    ?.filter(
      (row) => row.received !== null && row.recipient === user.value.username
    )
    .reduce((acc, value) => acc + +value.sum, 0);

  let sumOfPVZ1 = rows.value
    ?.filter(
      (row) => row.received !== null && row.createdUser === user.value.username
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ2 = rows.value
    ?.filter(
      (row) => row.received !== null && row.issuedUser === user.value.username
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  allSum.value = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2;
}

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
  await storeAdvanceReports.createAdvanceReport(
    rowData.value,
    user.value.username
  );
  rows.value = await storeAdvanceReports.getAdvancedReports();
  rows.value = rows.value?.filter(
    (row) => row.createdUser === user.value.username || row.issuedUser === user.value.username
  );
  getAllSum();
  closeModal();
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeAdvanceReports.updateAdvanceReport(
    rowData.value,
    user.value.username
  );
  rows.value = await storeAdvanceReports.getAdvancedReports();
  rows.value = rows.value?.filter(
    (row) => row.createdUser === user.value.username || row.issuedUser === user.value.username
  );
  getAllSum();
  closeModal();
  isLoading.value = false;
}

async function updateDeliveryRow(row: any) {
  isLoading.value = true;
  await storeAdvanceReports.updateDeliveryStatus(row.row);
  rows.value = await storeAdvanceReports.getAdvancedReports();
  rows.value = rows.value?.filter(
    (row) => row.createdUser === user.value.username || row.issuedUser === user.value.username
  );
  getAllSum();
  isLoading.value = false;
}

function formatNumber(number: number) {
  let numberString = number.toString();

  if (numberString.length <= 3) {
    return numberString;
  }

  let formattedString = "";
  let remainder = numberString.length % 3;

  if (remainder !== 0) {
    formattedString += numberString.slice(0, remainder) + " ";
  }

  for (let i = remainder; i < numberString.length; i += 3) {
    formattedString += numberString.slice(i, i + 3) + " ";
  }

  return formattedString.slice(0, -1);
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
          <div>
            <div class="text-center text-2xl">
              <h1>Баланс {{ user.username }}</h1>
              <h1 class="font-bold text-secondary-color text-4xl mt-3">
                {{ formatNumber(Math.ceil(allSum)) }} ₽
              </h1>
            </div>
          </div>

          <UIMainButton
            v-if="
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'DRIVER'
            "
            class="mt-24"
            @click="openModal"
          >
            Создание авансового документа
          </UIMainButton>
          <AdvanceReportTable
            :rows="rows"
            :user="user"
            @open-modal="openModal"
            @update-delivery-row="updateDeliveryRow"
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
              <select :disabled="rowData.id > 0"
                class="py-1 px-2 border-2 bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.issuedUser"
              >
                <option value="Шведова">Шведова</option>
                <option value="admin">admin</option>
                <option value="Косой">Косой</option>
                <option value="Шарафаненко">Шарафаненко</option>
                <option value="Волошина">Волошина</option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Расход</label>
              <input :disabled="rowData.id > 0"
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.expenditure"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1">Статья расхода</label>
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
                v-model="rowData.supportingDocuments"
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
          <div>
            <div class="text-center text-2xl">
              <h1>Баланс {{ user.username }}</h1>
              <h1 class="font-bold text-secondary-color text-4xl mt-3">
                {{ formatNumber(Math.ceil(allSum)) }} ₽
              </h1>
            </div>
          </div>

          <UIMainButton
            v-if="
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'DRIVER'
            "
            class="mt-24"
            @click="openModal"
          >
            Создание авансового документа
          </UIMainButton>
          <AdvanceReportTable
            :rows="rows"
            :user="user"
            @open-modal="openModal"
            @update-delivery-row="updateDeliveryRow"
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
              <select :disabled="rowData.id > 0"
                class="py-1 px-2 border-2 bg-transparent rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.issuedUser"
              >
                <option value="Шведова">Шведова</option>
                <option value="admin">admin</option>
                <option value="Косой">Косой</option>
                <option value="Шарафаненко">Шарафаненко</option>
                <option value="Волошина">Волошина</option>
              </select>
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Расход</label>
              <input :disabled="rowData.id > 0"
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.expenditure"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="dispatchPVZ1">Статья расхода</label>
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
                v-model="rowData.supportingDocuments"
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
