<script setup lang="ts">
import Cookies from "js-cookie";
import { usePayrollsStore } from "../../stores/payroll";

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storePayrolls = usePayrollsStore();
const storeEmployees = useEmployeesStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IPayroll>>();
let employees = ref<Array<IEmployee>>([]);
let originallyRows = ref<Array<IPayroll>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storePayrolls.getPayrolls();
  employees.value = await storeEmployees.getEmployees();
  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: "Расчёт ЗП",
});

let isOpen = ref(false);
let rowData = ref({} as IPayroll);

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IPayroll;
}

function openModal(row: IPayroll) {
  isOpen.value = true;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  let newDate;
  if (monthValue.value === month) {
    newDate = new Date(year, month, 5);
  } else {
    newDate = new Date(year, monthValue.value - 1, 5);
  }

  rowData.value = JSON.parse(JSON.stringify(row));
  rowData.value.date = newDate;
}

async function createReport(object: any) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const newDate = new Date(year, object.month - 1, 5);

  isLoading.value = true;
  const newArray = object.rows.map((employee: IEmployee) => ({
    PVZ: employee.PVZ,
    company: employee.company,
    fullname: employee.fullname,
    phone: employee.phone,
    bank: employee.bank,
    paymentPerShift: +(employee.paymentPerShift / employee.hoursPerShift).toFixed(2),
    advance: 0,
    hours: 0,
    deductions: 0,
    additionalPayment: 0,
    date: newDate,
  }));

  await storePayrolls.createPayrolls(newArray);
  rows.value = await storePayrolls.getPayrolls();
  isLoading.value = false;
}

async function updateReport(rowsData: IPayroll[]) {
  await storePayrolls.updatePayrolls(rowsData);
  rows.value = await storePayrolls.getPayrolls();
}

async function createRow() {
  await storePayrolls.createPayroll(rowData.value);
  rows.value = await storePayrolls.getPayrolls();
  closeModal();
}

async function updateRow() {
  await storePayrolls.updatePayroll(rowData.value);
  rows.value = await storePayrolls.getPayrolls();
  closeModal();
}

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить строку?");
  if (answer) {
    await storePayrolls.deletePayroll(id);
    rows.value = await storePayrolls.getPayrolls();
  }
}

const filteredRows = ref<Array<IAdvanceReport>>();
function handleFilteredRows(filteredRowsData: IAdvanceReport[]) {
  filteredRows.value = filteredRowsData;
}

let selectedWeek = ref("");

function getWeeks() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const weeks = [];
  let currentWeekStart = 1;
  let currentWeekEnd = 0;
  let weekNumber = 1;

  while (currentWeekStart <= getDaysInMonth(currentYear, currentMonth)) {
    const weekStart = new Date(currentYear, currentMonth, currentWeekStart);
    const dayOfWeek = weekStart.getDay();

    currentWeekEnd = currentWeekStart + (7 - dayOfWeek);
    if (currentWeekEnd > getDaysInMonth(currentYear, currentMonth)) {
      currentWeekEnd = getDaysInMonth(currentYear, currentMonth);
    }

    weeks.push(
      `${weekNumber} неделя (${formatDate(weekStart)}-${formatDate(
        new Date(currentYear, currentMonth, currentWeekEnd)
      )})`
    );

    currentWeekStart = currentWeekEnd + 1;
    weekNumber++;
  }
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  weeks.push(
    `${getMonthName(currentMonth)} (${formatDate(firstDayOfMonth)}-${formatDate(
      lastDayOfMonth
    )})`
  );
  selectedWeek.value = weeks[0];
  return weeks;
}

function getDaysInMonth(year: any, month: any) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(date: any) {
  return String(date.getDate()).padStart(2, "0");
}

function getMonthName(month: any) {
  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  return monthNames[month];
}

const weeks = getWeeks();

let month = ref(new Date().getMonth() + 1);

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
  "ПВЗ_1",
  "ПВЗ_2",
  "ПВЗ_3",
  "ПВЗ_4",
  "ППВЗ_5",
  "ППВЗ_6",
  "Офис",
  "НаДом",
]);

let companies = ref(["W/O/Я start", "Darom.pro", "Сортировка", "Доставка"]);

let banks = ref(["тинькофф", "сбер", "почтабанк", "озон", "яндекс банк", "альфа банк"]);

function autoInfoByFullname() {
  let row = employees.value.filter((row) => row.fullname === rowData.value.fullname);
  rowData.value.PVZ = row[0].PVZ;
  rowData.value.company = row[0].company;
  rowData.value.phone = row[0].phone;
  rowData.value.bank = row[0].bank;
  rowData.value.paymentPerShift2 = row[0].paymentPerShift;
  rowData.value.hoursPerShift = row[0].hoursPerShift;
  rowData.value.paymentPerShift = +(
    row[0].paymentPerShift / row[0].hoursPerShift
  ).toFixed(2);
}

let monthValue = ref(0);
function getSelectedMonth(monthNumber: number) {
  monthValue.value = monthNumber;
}
</script>

<template>
  <Head>
    <Title>Расчёт ЗП</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <div
            class="flex items-center justify-between max-sm:flex-col gap-3 max-sm:items-start"
          >
            <UIMainButton @click="openModal">Создать запись</UIMainButton>
            <NuxtLink
              to="/advance-report/employees"
              class="underline text-secondary-color font-bold text-xl hover:opacity-50 duration-200"
              >Перейти к сотрудникам</NuxtLink
            >
          </div>

          <PayrollTable
            :rows="rows"
            :employees="employees"
            :user="user"
            @open-modal="openModal"
            @get-month="getSelectedMonth"
            @create-report="createReport"
            @update-report="updateReport"
            @delete-row="deleteRow"
          />

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
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.PVZ"
                >
                  <option v-for="pvzData in pvz" :value="pvzData">
                    {{ pvzData }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">Компания</label>
                <select
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.company"
                >
                  <option v-for="company in companies" :value="company">
                    {{ company }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">ФИО</label>
                <select
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  @change="autoInfoByFullname"
                  v-model="rowData.fullname"
                >
                  <option
                    v-for="employee in employees.sort((a, b) =>
                      a.fullname.localeCompare(b.fullname)
                    )"
                    :value="employee.fullname"
                  >
                    {{ employee.fullname }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Телефон</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.phone"
                  type="text"
                />
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">Банк</label>
                <select
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.bank"
                >
                  <option v-for="bank in banks" :value="bank">
                    {{ bank }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Аванс</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.advance"
                  type="number"
                />
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Кол-во часов всего</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.hours"
                  type="number"
                />
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Удержания</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.deductions"
                  type="number"
                />
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Доплата</label>
                <input
                  class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.additionalPayment"
                  type="number"
                />
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Примечание</label>
                <select
                  class="py-1 px-2 border-2 max-w-[200px] bg-transparent rounded-lg text-sm disabled:text-gray-400"
                  v-model="rowData.notation"
                >
                  <option value="">Пусто</option>
                  <option value="Нам должны">Нам должны</option>
                  <option value="Расчёт уволенных сотрудников">
                    Расчёт уволенных сотрудников
                  </option>
                  <option value="Оплачено">Оплачено</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10" v-if="rowData.id">
              <UIMainButton @click="updateRow">Сохранить</UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton @click="createRow">Создать </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </UIModal>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user"></NuxtLayout>
    </div>
  </div>

  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
