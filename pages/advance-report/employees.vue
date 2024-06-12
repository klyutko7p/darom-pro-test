<script setup lang="ts">
import Cookies from "js-cookie";
import { useEmployeesStore } from "../../stores/employee";

const storeUsers = useUsersStore();
const storeEmployees = useEmployeesStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IEmployee>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  const employees = await storeEmployees.getEmployees();
  rows.value = employees!;
  isLoading.value = false;

  //   rows.value = await storeAdvanceReports.getAdvancedReports();
  //   originallyRows.value = rows.value;
  //   rowsOurRansom.value = await storeRansom.getRansomRowsForAdvanceReport(
  //     "OurRansom"
  //   );
  //   rowsDelivery.value = await storeRansom.getRansomRowsForBalance("Delivery");
  //   originallyRows.value = rows.value;

  //   if (user.value.role !== "ADMIN") {
  //     rows.value = rows.value?.filter(
  //       (row) =>
  //         row.createdUser === user.value.username ||
  //         row.issuedUser === user.value.username
  //     );
  //   } else {
  //     rows.value = rows.value;
  //   }

  //   if (rows.value) {
  //     handleFilteredRows(rows.value);
  //   }

  //   ourRansomRows.value = await storeRansom.getRansomRowsForBalance("OurRansom");
  //   clientRansomRows.value = await storeRansom.getRansomRowsForBalance(
  //     "ClientRansom"
  //   );
  //   rowsBalance.value = await storeBalance.getBalanceRows();
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: "Сотрудники",
});

let isOpen = ref(false);
let rowData = ref({} as IEmployee);

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IEmployee;
}

function openModal(row: IEmployee) {
  isOpen.value = true;
  rowData.value = JSON.parse(JSON.stringify(row));
}

async function createRow() {
  isLoading.value = true;
  await storeEmployees.createEmployee(rowData.value);
  const employees = await storeEmployees.getEmployees();
  rows.value = employees!;

  closeModal();
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeEmployees.updateEmployee(rowData.value);
  const employees = await storeEmployees.getEmployees();
  rows.value = employees!;

  closeModal();
  isLoading.value = false;
}

async function deleteRow(id: number) {
  isLoading.value = true;
  await storeEmployees.deleteEmployee(id);
  const employees = await storeEmployees.getEmployees();
  rows.value = employees!;

  closeModal();
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
  "Мещерино Городок",
  "Новоандриановка",
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

let banks = ref(["тинькофф", "сбер", "почтабанк", "озон", "яндекс банк", "альфа банк", "центр инвест"]);
</script>

<template>
  <Head>
    <Title>Сотрудники</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <div class="flex items-center justify-between max-sm:flex-col max-sm:items-start gap-3">
          <UIMainButton @click="openModal">Создать сотрудника</UIMainButton>
            <NuxtLink to="/advance-report/payroll" class="underline text-secondary-color font-bold text-xl hover:opacity-50 duration-200">Перейти к расчёту ЗП</NuxtLink>
          </div>

          <EmployeeTable
            :rows="rows"
            :user="user"
            @open-modal="openModal"
            @delete-row="deleteRow"
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
              <input
                class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.fullname"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Телефон/Карта</label>
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
              <label for="name">Оплата в смену</label>
              <input
                class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.paymentPerShift"
                type="number"
              />
            </div>

            <div class="grid grid-cols-2 mb-5">
              <label for="name">Часов в смене</label>
              <input
                class="bg-transparent w-full max-w-[200px] rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.hoursPerShift"
                type="number"
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
      <NuxtLayout name="user"> </NuxtLayout>
    </div>
  </div>

  <div v-else class="flex items-center justify-center">
      <UISpinner />
  </div>
</template>
