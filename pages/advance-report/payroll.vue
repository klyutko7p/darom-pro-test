<script setup lang="ts">
import Cookies from "js-cookie";
import { usePayrollsStore } from "../../stores/payroll";

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storePayrolls = usePayrollsStore();
const storeEmployees = useEmployeesStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IPayroll>>([]);
let employees = ref<Array<IEmployee>>([]);
let originallyRows = ref<Array<IPayroll>>([]);
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

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storePayrolls.getPayrolls();
  employees.value = await storeEmployees.getEmployees();
  isLoading.value = false;

  const storedMonthData = loadFromLocalStorage("monthDataPayroll");
  if (storedMonthData !== null) {
    monthValue.value = storedMonthData;
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
  let year = 2025;

  const storedYearData = loadFromLocalStorage("yearPayroll");
  if (storedYearData !== null) {
    year = storedYearData;
  }

  const month = currentDate.getMonth();

  const storedMonthData = loadFromLocalStorage("monthDataPayroll");
  if (storedMonthData !== null) {
    monthValue.value = storedMonthData;
  }

  let newDate;
  newDate = new Date(year, monthValue.value - 1, 5);

  rowData.value = JSON.parse(JSON.stringify(row));
  rowData.value.fullname = employees.value.find(
    (employee) => employee.fullname === rowData.value.fullname
  )?.id;

  if (row.id) {
    rowData.value.date = rowData.value.date;
  } else {
    rowData.value.date = newDate;
  }
}

async function createReport(object: any) {
  const currentDate = new Date();
  const year = object.year;
  const newDate = new Date(year, object.month - 1, 5);

  isLoading.value = true;
  const newArray = object.rows.map((employee: IEmployee) => ({
    PVZ: employee.PVZ,
    company: employee.company,
    job: employee.job,
    fullname: employee.fullname,
    phone: employee.phone,
    bank: employee.bank,
    paymentPerShift: +(
      employee.paymentPerShift / employee.hoursPerShift
    ).toFixed(2),
    advance: 0,
    advanceFourssan: 0,
    hours: 0,
    deductions: 0,
    additionalPayment: 0,
    salaryFourssan: 0,
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
  isLoading.value = true;
  rowData.value.fullname = employees.value.find(
    (employee) => employee.id === rowData.value.fullname
  )?.fullname;
  await storePayrolls.createPayroll(rowData.value);
  rows.value = await storePayrolls.getPayrolls();
  isLoading.value = false;
  closeModal();
}

async function updateRow() {
  isLoading.value = true;
  rowData.value.fullname = employees.value.find(
    (employee) => employee.id === rowData.value.fullname
  )?.fullname;
  await storePayrolls.updatePayroll(rowData.value);
  rows.value = await storePayrolls.getPayrolls();
  isLoading.value = false;
  closeModal();
}

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить строку?");
  if (answer) {
    isLoading.value = true;
    await storePayrolls.deletePayroll(id);
    rows.value = await storePayrolls.getPayrolls();
  }
  isLoading.value = false;
}

const filteredRows = ref<Array<IAdvanceReport>>();

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
  "Магазин",
  "Офис",
  "НаДом",
]);

let companies = ref(["W/O/Я start", "Darom.pro", "Сортировка", "Доставка"]);

let jobs: string[] = [
  "Руководитель проекта",
  "Управляющий ПВЗ",
  "Сотрудник ПВЗ",
  "Секретарь",
  "Директор",
  "Сортировщик",
  "Служба поддержки",
  "Светлана",
  "Водитель",
];

let banks = ref([
  "тинькофф",
  "сбер",
  "почтабанк",
  "озон",
  "яндекс банк",
  "альфа банк",
  "центр инвест",
  "ВТБ",
  "райффайзен",
]);

function autoInfoByFullname() {
  let row = employees.value.filter((row) => row.id === rowData.value.fullname);
  rowData.value.PVZ = row[0].PVZ;
  rowData.value.company = row[0].company;
  rowData.value.phone = row[0].phone;
  rowData.value.job = row[0].job;
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

const options = [
  { value: "", label: "Пусто" },
  { value: "Нам должны", label: "Нам должны" },
  {
    value: "Расчёт уволенных сотрудников",
    label: "Расчёт уволенных сотрудников",
  },
  { value: "Оплачено", label: "Оплачено" },
];

function clearLocalStorage() {
  const addressData = localStorage.getItem("addressData");
  const monthDataPayroll = localStorage.getItem("monthDataPayroll");
  localStorage.clear();

  if (addressData) {
    localStorage.setItem("addressData", addressData);
  }

  if (monthDataPayroll) {
    localStorage.setItem("monthDataPayroll", monthDataPayroll);
  }
}

onUnmounted(() => {
  clearLocalStorage();
});
</script>

<template>
  <Head>
    <Title>Расчёт ЗП</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div class="bg-gray-50 px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <div
            class="flex items-center justify-between gap-3 max-sm:items-start"
          >
            <UIActionButton @click="openModal">Создать запись</UIActionButton>
            <div
              class="bg-secondary-color cursor-pointer hover:opacity-50 duration-200 rounded-full pt-1.5 px-1.5 text-white"
              @click="router.push('/advance-report/employees')"
            >
              <Icon name="gridicons:multiple-users" size="24" />
            </div>
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

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon size="24" name="gravity-ui:circle-ruble" />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание нового документа</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">ПВЗ</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.PVZ"
                    :options="pvz"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">Компания</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.company"
                    :options="companies"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">ФИО</label>
                  <UInputMenu
                    class="w-full"
                    v-model="rowData.fullname"
                    value-attribute="id"
                    option-attribute="fullname"
                    :options="
                      employees.sort((a, b) =>
                        a.fullname.localeCompare(b.fullname)
                      )
                    "
                    @change="autoInfoByFullname"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="job">Должность</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.job"
                    :options="jobs"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Телефон</label>
                  <UInput class="w-full" v-model="rowData.phone" type="text" />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">Банк</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.bank"
                    :options="banks"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Аванс ФОССАН</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.advanceFourssan"
                    type="number"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Аванс</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.advance"
                    type="number"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Кол-во часов всего</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.hours"
                    type="number"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Удержания</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.deductions"
                    type="number"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Доплата</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.additionalPayment"
                    type="number"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">ЗП ФОССАН</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.salaryFourssan"
                    type="number"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Примечание</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.notation"
                    option-attribute="label"
                    value-attribute="value"
                    :options="options"
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
      <NuxtLayout name="user"></NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
