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
const pvz = ref<Array<string>>([]);
const companies = ref<Array<string>>([]);
const banks = ref<Array<string>>([]);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  pvz.value = storeEmployees.getPVZ();
  companies.value = storeEmployees.getCompanies();
  banks.value = storeEmployees.getBanks();
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
      <NuxtLayout name="table-admin-no-pad">
        <div class="bg-[#f8f9fd] px-16 w-screen pt-10 max-sm:px-5 pb-5">
          <div
            class="flex items-center justify-between max-sm:items-start gap-3"
          >
            <UIMainButton @click="openModal">Создать сотрудника</UIMainButton>
            <div class="flex justify-end">
              <div
                class="bg-secondary-color cursor-pointer hover:opacity-50 duration-200 rounded-full pt-1.5 px-1.5 text-white"
                @click="router.push('/advance-report/payroll')"
              >
                <Icon name="material-symbols:gpay" size="24" />
              </div>
            </div>
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
                <UInput class="w-full" v-model="rowData.fullname" type="text" />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Телефон/Карта</label>
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
                <label for="name">Оплата в смену</label>
                <UInput
                  class="w-full"
                  v-model="rowData.paymentPerShift"
                  type="number"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Часов в смене</label>
                <UInput
                  class="w-full"
                  v-model="rowData.hoursPerShift"
                  type="number"
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
              <UISaveModalButton @click="createRow">Создать </UISaveModalButton>
              <UIExitModalButton @click="closeModal"
                >Отменить
              </UIExitModalButton>
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
