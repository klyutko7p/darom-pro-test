<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storePVZ = usePVZStore();
const storeRansom = useRansomStore();
const storeSC = useSortingCentersStore();
const router = useRouter();

const isOpen = ref(false);

const fields = [
  "изменение",
  "удаление",
  "имя пользователя",
  "роль",
  "Доступ к пвз",
  "дата создания",
  "сортировочный центр",
  "ПВЗ",
  "ячейка (наш выкуп)",
  "ячейка (выкуп клиента)",
  "дополнительно (наш выкуп)",
  "дополнительно (выкуп клиента)",
  "дополнительно (доставка)",
  "доставлено на СЦ (наш выкуп)",
  "доставлено на СЦ (выкуп клиента)",
  "доставлено на ПВЗ (наш выкуп)",
  "доставлено на ПВЗ (выкуп клиента)",
  "дополнительный доход (наш выкуп)",
  "дополнительный доход (выкуп клиента)",
  "отправка в ПВЗ (наш выкуп)",
  "отправка в ПВЗ (выкуп клиента)",
  "отправка в ПВЗ (доставка)",
  "отсортировано (доставка)",
  "оплачено (доставка)",
  "имя (доставка)",
  "телефон (наш выкуп)",
  "телефон (выкуп клиента)",
  "телефон (доставка)",
  "выдан клиенту (наш выкуп)",
  "выдан клиенту (выкуп клиента)",
  "аккаунт заказа (наш выкуп)",
  "заказано на сортировочный центр (наш выкуп)",
  "заказано на сортировочный центр (выкуп клиента)",
  "заказано на сортировочный центр (доставка)",
  "процент с клиента (наш выкуп)",
  "процент с клиента (выкуп клиента)",
  "процент с клиента (доставка)",
  "примечание (наш выкуп)",
  "примечание (выкуп клиента)",
  "стоимость выкупа товара (выкуп клиента)",
  "стоимость выкупа товара (доставка)",
  "стоимость сайт (наш выкуп)",
  "предоплата (наш выкуп)",
  "предоплата (выкуп клиента)",
  "товар (ссылка) (наш выкуп)",
  "маркетплейс (выкуп клиента)",
  "название товара (наш выкуп)",
  "количество товаров (выкуп клиента)",
  "данные (Наш выкуп)",
  "данные (Выкуп клиента)",
  "данные (Доставка)",
  "сумма с клиента (Наш выкуп)",
  "сумма с клиента (Выкуп клиента)",
  "сумма с клиента (Доставка)",
  "ссылка для клиента (Наш выкуп)",
  "ссылка для клиента (Выкуп клиента)",
  "ссылка для клиента (Доставка)",
  "прибыль (доход) (Наш выкуп)",
  "прибыль (доход) (Выкуп клиента)",
  "прибыль (доход) (Доставка)",
];

let userData = ref({} as User);

function openModal(user: User) {
  isOpen.value = true;
  userData.value = JSON.parse(JSON.stringify(user));
}

function closeModal() {
  isOpen.value = false;
  userData.value = {} as User;
}

async function createUser(userData: User) {
  isLoading.value = true;
  await storeUsers.createUser(userData.username, userData.password, userData.role);
  users.value = await storeUsers.getUsers();
  isLoading.value = false;
}

async function updateUser() {
  isLoading.value = true;
  await storeUsers.updateUser(userData.value);
  users.value = await storeUsers.getUsers();
  closeModal();
  isLoading.value = false;
}

async function updateSum(sum: any) {
  isLoading.value = true;
  await storeRansom.updateSumOfRejection(sum.value);
  sumOfRejection.value = await storeRansom.getSumOfRejection();
  isLoading.value = false;
}

async function deleteUser(usernameData: string) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данного пользователя?");
  if (answer) await storeUsers.deleteUser(usernameData);
  users.value = await storeUsers.getUsers();
  isLoading.value = false;
}

let user = ref({} as User);
let users = ref<Array<User>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();
let sumOfRejection = ref<any>();

const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  users.value = await storeUsers.getUsers();
  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSC.getSortingCenters();
  sumOfRejection.value = await storeRansom.getSumOfRejection();
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

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
    <Title>Пользователи</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading">
        <AdminUsersTable
          :fields="fields"
          :users="users"
          @delete-user="deleteUser"
          @open-modal="openModal"
        />

        <AdminUsersCreate
          :sum="sumOfRejection"
          @update-sum="updateSum"
          @create-user="createUser"
        />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="ci:users" />
          </template>
          <template v-slot:header>
            <div class="custom-header">
              <h1 class="text-left">Изменение:  {{ userData.username }}</h1>
            </div>
          </template>
          <template v-slot:body>
            <div class="text-black max-sm:text-sm">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Имя пользователя</label>
                <input
                  class="bg-transparent w-full rounded-xl border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="userData.username"
                  type="text"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="role">Роль</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.role"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                  <option value="SORTIROVKA">SORTIROVKA</option>
                  <option value="PVZ">PVZ</option>
                  <option value="PPVZ">PPVZ</option>
                  <option value="RMANAGER">RMANAGER</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                  <option value="COURIER">COURIER</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="SHVEDOVA">SHVEDOVA</option>
                  <option value="OFFICE">OFFICE</option>
                </select>
              </div>
              <div
                class="flex items-center justify-centers gap-3 mb-5 flex-wrap text-center max-sm:flex-col"
              >
                <label v-for="(pvzData, index) in pvz" :key="index">
                  <input type="checkbox" :value="pvzData.name" v-model="userData.PVZ" />
                  {{ pvzData.name }}
                </label>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сортировочный центр</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.visibleSC"
                >
                  <option value="ВСЕ">ВСЕ</option>
                  <option
                    v-for="sortingCenter in sortingCenters"
                    :value="sortingCenter.name"
                  >
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">ПВЗ</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.visiblePVZ"
                >
                  <option value="ВСЕ">ВСЕ</option>
                  <option v-for="valueData in pvz" :value="valueData.name">
                    {{ valueData.name }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ячейка (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.cell1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ячейка (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.cell2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительно (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.additionally1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительно (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.additionally2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительно (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.additionally3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на СЦ (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.deliveredSC1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на СЦ (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.deliveredSC2"
                >
                  <
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на ПВЗ (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.deliveredPVZ1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на ПВЗ (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.deliveredPVZ2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительный доход (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.deliveredKGT1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительный доход (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.deliveredKGT2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отправка в ПВЗ (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.dispatchPVZ1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отправка в ПВЗ (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.dispatchPVZ2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отправка в ПВЗ (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.dispatchPVZ3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отсортировано (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.sorted"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Оплачено (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.paid"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Имя (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.name3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Телефон (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.fromName1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Телефон (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.fromName2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Телефон (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.fromName3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Выдан клиенту (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.issued1"
                >
                  <
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Выдан клиенту (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.issued2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Аккаунт заказа (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.orderAccount"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Заказано на СЦ (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.orderPVZ1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Заказано на СЦ (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.orderPVZ2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Заказано на СЦ (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.orderPVZ3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Процент с клиента (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.percentClient1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Процент с клиента (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.percentClient2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Процент с клиента (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.percentClient3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Примечание (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.notation1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Примечание (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.notation2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Стоимость выкупа товара (Выкуп клиента) </label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.priceProgram"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Стоимость выкупа товара (Доставка) </label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.purchaseOfGoods"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Стоимость сайт (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.priceSite"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Предоплата (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.prepayment1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Предоплата (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.prepayment2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Товар (ссылка) (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.productLink1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Маркетплейс (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.productLink2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Название товара (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.productName1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Количество товаров (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.productName2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Данные (Наш Выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.dataOurRansom"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Данные (Выкуп Клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.dataClientRansom"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Данные (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.dataDelivery"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сумма с клиента (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.amountFromClient1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сумма с клиента (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.amountFromClient2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сумма с клиента (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.amountFromClient3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ссылка для клиента (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.clientLink1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ссылка для клиента (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.clientLink2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ссылка для клиента (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.clientLink3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div v class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Прибыль (доход) (Наш выкуп)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.profit1"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Прибыль (доход) (Выкуп клиента)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.profit2"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Прибыль (доход) (Доставка)</label>
                <select
                  class="py-1.5 px-3 border-2 bg-transparent w-full rounded-xl text-base"
                  v-model="userData.profit3"
                >
                  <option value="NONE">Не видеть</option>
                  <option value="READ">Видеть</option>
                  <option value="WRITE">Редактировать</option>
                </select>
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="updateUser">СОХРАНИТЬ</UISaveModalButton>
              <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-else-if="user.role === 'USER'">
    <NuxtLayout name="user">
      <h1>
        У вас недостаточно прав на просмотр этой информации. Обратитесь к администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
