<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storePayments = usePaymentsStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<MonthlyPayment>>([]);
let advanceRows = ref<Array<IAdvanceReport>>([]);
let originallyRows = ref<Array<MonthlyPayment>>([]);
const token = Cookies.get("token");
let isLoading = ref(false);

function loadFromLocalStorage(key: string) {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }
  user.value = await storeUsers.getUser();

  isLoading.value = true;
  rows.value = await storePayments.getPayments();

  let advanceReportsPromise;

  advanceReportsPromise = storeAdvanceReports.getAdvancedReports(user.value);

  const [advanceReportsData] = await Promise.all([advanceReportsPromise]);

  advanceRows.value = advanceReportsData;

  isLoading.value = false;

  const storedMonthData = loadFromLocalStorage("monthDataPayments");
  if (storedMonthData !== null) {
    monthValue.value = storedMonthData;
  }
});

definePageMeta({
  layout: false,
  name: "Ежемесячные платежи",
});

let isOpen = ref(false);
let rowData = ref({} as MonthlyPayment);

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as MonthlyPayment;
}

const storeBanks = useBanksStore();
const banks = ref<Array<Bank>>([]);
async function createAdvanceReport(obj: any) {
  isLoading.value = true;
  let item = {} as IAdvanceReport;
  item = obj.row;
  item.createdUser = obj.createdUser;
  delete item.id;

  await storeAdvanceReports.createAdvanceReport(item, obj.createdUser);

  if (
    item.typeOfExpenditure !== "Перевод с баланса безнал" &&
    item.typeOfExpenditure !== "Новый кредит безнал" &&
    item.typeOfExpenditure !== "Пополнение баланса" &&
    item.typeOfExpenditure !== "Удержания с сотрудников" &&
    item.type === "Безнал"
  ) {
    banks.value = await storeBanks.getBanks();
    let idMainBank = banks.value.find((bank) => bank.main === true)?.id;
    let maxIdRowData = advanceRows.value.reduce((maxRow: any, currentRow: any) => {
      return currentRow.id > (maxRow?.id || -Infinity) ? currentRow : maxRow;
    }, null);

    let transaction = {
      type: "expenditure",
      sum: Number(item.expenditure),
      createdUser: user.value.username,
      fromBankId: idMainBank,
      toBankId: idMainBank,
      idRow: maxIdRowData.id + 1,
    } as any;

    await storeBanks.createTransaction(transaction);
  }

  let advanceReportsPromise;

  advanceReportsPromise = storeAdvanceReports.getAdvancedReports(user.value);

  const [advanceReportsData] = await Promise.all([advanceReportsPromise]);

  advanceRows.value = advanceReportsData;

  isLoading.value = false;
}

function openModal(row: IPayroll) {
  isOpen.value = true;
  const currentDate = new Date();
  let year = 2025;

  const storedYearData = loadFromLocalStorage("yearPayments");
  if (storedYearData !== null) {
    year = storedYearData;
  }

  const month = currentDate.getMonth();

  const storedMonthData = loadFromLocalStorage("monthDataPayments");
  if (storedMonthData !== null) {
    monthValue.value = storedMonthData;
  }

  let newDate;
  newDate = new Date(2025, 0, 2);

  rowData.value = JSON.parse(JSON.stringify(row));

  if (row.id) {
    rowData.value.date = rowData.value.date;
  } else {
    rowData.value.date = newDate;
    rowData.value.typeOfExpenditure = "Ежемесячные платежи";
  }
}

async function updateReport(rowsData: MonthlyPayment[]) {
  await storePayments.updatePayments(rowsData);
  rows.value = await storePayments.getPayments();
}

async function getRowByIdFromInput(rowsData: MonthlyPayment[]) {
  await storePayments.updatePayments(rowsData);
  rows.value = await storePayments.getPayments();
}

async function createRow() {
  isLoading.value = true;
  await storePayments.createPayment(rowData.value);
  rows.value = await storePayments.getPayments();
  isLoading.value = false;
  closeModal();
}

async function updateRow() {
  isLoading.value = true;
  await storePayments.updatePayment(rowData.value);
  rows.value = await storePayments.getPayments();
  isLoading.value = false;
  closeModal();
}

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить строку?");
  if (answer) {
    isLoading.value = true;
    await storePayments.deletePayment(id);
    rows.value = await storePayments.getPayments();
  }
  isLoading.value = false;
}

let pvz = ref([
  "Ряженое",
  "Алексеевка",
  "Латоново",
  "Надежда",
  "Александровка",
  "Новониколаевка",
  "Политотдельское",
  "Мещерино",
  "Коломенское ЯМ",
  "Коломенское WB",
  "Бессоново WB",
  "Бессоново OZ",
  "Новоандриановка",
  "ПВЗ_1",
  "ПВЗ_2",
  "ПВЗ_3",
  "ПВЗ_4",
  "ППВЗ_5",
  "ППВЗ_7",
  "ПВЗ_8",
  "ППВЗ_9",
  "ПВЗ_10",
  "ПВЗ_11",
  "ППВЗ_12",
  "ПВЗ_13",
  "ПВЗ_14",
  "Магазин",
  "Офис",
  "НаДом",
]);

let companies = ref(["W/O/Я start", "Darom.pro", "Сортировка", "Доставка"]);

let monthValue = ref(0);
function getSelectedMonth(monthNumber: number) {
  monthValue.value = monthNumber;
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

function clearLocalStorage() {
  const addressData = localStorage.getItem("addressData");
  const monthDataPayroll = localStorage.getItem("monthDataPayment");
  localStorage.clear();

  if (addressData) {
    localStorage.setItem("addressData", addressData);
  }

  if (monthDataPayroll) {
    localStorage.setItem("monthDataPayment", monthDataPayroll);
  }
}

onUnmounted(() => {
  clearLocalStorage();
});
</script>

<template>
  <Head>
    <Title>Ежемесячные платежи</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div class="bg-gray-50 px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <div
            class="flex items-center justify-between gap-3 max-sm:items-start"
          >
            <UIActionButton
              v-if="
                user.username === 'Директор' || user.username === 'Власенкова'
              "
              @click="openModal"
              >Добавить платёж</UIActionButton
            >
          </div>

          <PaymentsTable
            :rows="rows"
            :advance-rows="advanceRows"
            :user="user"
            @open-modal="openModal"
            @get-month="getSelectedMonth"
            @update-report="updateReport"
            @delete-row="deleteRow"
            @createAdvanceReport="createAdvanceReport"
            @getRowByIdFromInput="getRowByIdFromInput"
          />

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon size="24" name="gravity-ui:circle-ruble" />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание нового платежа</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="PVZ">ПВЗ</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.PVZ"
                    :options="pvz"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="expenditure">Расход</label>
                  <UInput class="w-full" v-model="rowData.expenditure" />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="expenditure">Статья расхода</label>
                  <UInput class="w-full" v-model="rowData.typeOfExpenditure" />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="notation">Комментарий</label>
                  <UInput class="w-full" v-model="rowData.notation" />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="company">Компания</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.company"
                    :options="companies"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="company">Тип</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.type"
                    :options="['Нал', 'Безнал']"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton @click="createRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="table-user-no-pad">
        <div class="bg-gray-50 px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <PaymentsTable
            :rows="rows.filter((row) => user.PVZ.includes(row.PVZ))"
            :advance-rows="advanceRows"
            :user="user"
            @open-modal="openModal"
            @get-month="getSelectedMonth"
            @update-report="updateReport"
            @delete-row="deleteRow"
            @createAdvanceReport="createAdvanceReport"
            @getRowByIdFromInput="getRowByIdFromInput"
          />
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
