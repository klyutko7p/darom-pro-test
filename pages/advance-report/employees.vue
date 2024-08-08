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


onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  const employees = await storeEmployees.getEmployees();
  rows.value = employees!;
  isLoading.value = false;
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
  "Бессоново",
  "Новоандриановка",
  "ПВЗ_1",
  "ПВЗ_2",
  "ПВЗ_3",
  "ПВЗ_4",
  "ППВЗ_5",
  "ППВЗ_7",
  "Офис",
  "НаДом",
]);

let companies = ref(["W/O/Я start", "Darom.pro", "Сортировка", "Доставка"]);

let banks = ref([
  "тинькофф",
  "сбер",
  "почтабанк",
  "озон",
  "яндекс банк",
  "альфа банк",
  "центр инвест",
  "ВТБ",
]);

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
</script>

<template>
  <Head>
    <Title>Сотрудники</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <div
            class="flex items-center justify-between max-sm:flex-col max-sm:items-start gap-3"
          >
            <UIMainButton @click="openModal">Создать сотрудника</UIMainButton>
            <NuxtLink
              to="/advance-report/payroll"
              class="bg-orange-500 px-5 py-2 text-white rounded-full text-secondary-color font-bold text-base hover:opacity-50 duration-200"
              >Перейти к расчёту ЗП</NuxtLink
            >
          </div>

          <EmployeeTable
            :rows="rows"
            :user="user"
            @open-modal="openModal"
            @delete-row="deleteRow"
          />
        </div>

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="gravity-ui:circle-ruble" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Создание нового сотрудника</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">ПВЗ</label>
              <select
                class="py-1 px-2 border-2 bg-transparent w-full rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.PVZ"
              >
                <option v-for="pvzData in pvz" :value="pvzData">
                  {{ pvzData }}
                </option>
              </select>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">Компания</label>
              <select
                class="py-1 px-2 border-2 bg-transparent w-full rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.company"
              >
                <option v-for="company in companies" :value="company">
                  {{ company }}
                </option>
              </select>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">ФИО</label>
              <input
                class="bg-transparent w-full  rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.fullname"
                type="text"
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Телефон/Карта</label>
              <input
                class="bg-transparent w-full  rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.phone"
                type="text"
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">Банк</label>
              <select
                class="py-1 px-2 border-2 bg-transparent w-full rounded-lg text-sm disabled:text-gray-400"
                v-model="rowData.bank"
              >
                <option v-for="bank in banks" :value="bank">
                  {{ bank }}
                </option>
              </select>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Оплата в смену</label>
              <input
                class="bg-transparent w-full  rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.paymentPerShift"
                type="number"
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Часов в смене</label>
              <input
                class="bg-transparent w-full  rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.hoursPerShift"
                type="number"
              />
            </div>
          </div>
          </template>
          <template v-slot:footer>
            <div class="flex items-center justify-center gap-3" v-if="rowData.id">
              <UISaveModalButton @click="updateRow">Сохранить </UISaveModalButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3" v-else>
              <UISaveModalButton @click="createRow">Создать </UISaveModalButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </template>
        </UINewModalEdit>
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
