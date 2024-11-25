<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storePVZ = usePVZStore();
const storeRansom = useRansomStore();
const storeSC = useSortingCentersStore();
const router = useRouter();

const isOpen = ref(false);

const fields = [
  "имя",
  "роль",
  "Доступ к пвз",
  "сц",
  "ПВЗ",
  "ячейка (1)",
  "ячейка (2)",
  "доп. (1)",
  "доп. (2)",
  "доп. (3)",
  "дост. на СЦ (1)",
  "дост. на СЦ (2)",
  "дост. на ПВЗ (1)",
  "дост. на ПВЗ (2)",
  "доп. доход (1)",
  "доп. доход (2)",
  "отпр. в ПВЗ (1)",
  "отпр. в ПВЗ (2)",
  "отпр. в ПВЗ (3)",
  "отсорт. (3)",
  "оплач. (3)",
  "имя (3)",
  "телефон (1)",
  "телефон (2)",
  "телефон (3)",
  "выдан кл. (1)",
  "выдан кл. (2)",
  "аккаунт (1)",
  "заказ. на сц (1)",
  "заказ. на сц (2)",
  "заказ. на сц (3)",
  "процент (1)",
  "процент (2)",
  "процент (3)",
  "примечание (1)",
  "примечание (2)",
  "ст. выкупа (2)",
  "ст. выкупа (3)",
  "ст. сайт (1)",
  "предопл. (1)",
  "предопл. (2)",
  "тов. (ссылка) (1)",
  "маркетплейс (2)",
  "название тов. (1)",
  "кол-во тов. (2)",
  "данные (1)",
  "данные (2)",
  "данные (3)",
  "сумма с кл. (1)",
  "сумма с кл. (2)",
  "сумма с кл. (3)",
  "ссылка для кл. (1)",
  "ссылка для кл. (2)",
  "ссылка для кл. (3)",
  "доход (1)",
  "доход (2)",
  "доход (3)",
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
  await storeUsers.createUser(
    userData.username,
    userData.password,
    userData.role
  );
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
let allPVZ = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();
let sumOfRejection = ref<any>();

const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  const [
    userResponse,
    usersResponse,
    pvzResponse,
    sortingCentersResponse,
    sumOfRejectionResponse,
  ] = await Promise.all([
    await storeUsers.getUser(),
    storeUsers.getUsers(),
    await storePVZ.getPVZ(),
    await storeSC.getSortingCenters(),
    storeRansom.getSumOfRejection(),
  ]);

  user.value = userResponse;
  users.value = usersResponse;
  sortingCenters.value = prepareSCList(sortingCentersResponse);
  allPVZ.value = pvzResponse;
  pvz.value = preparePVZList(pvzResponse);
  sumOfRejection.value = sumOfRejectionResponse;

  isLoading.value = false;
});

function prepareSCList(sortingCenters: SortingCenter[]): SortingCenter[] {
  const updatedSCList = [...sortingCenters];

  if (!updatedSCList.some((sc) => sc.id === 111111)) {
    updatedSCList.unshift({ id: 111111, name: "ВСЕ", address: "" });
  }

  return updatedSCList;
}

function preparePVZList(pvzList: PVZ[]): PVZ[] {
  const updatedPVZList = [...pvzList];

  if (!updatedPVZList.some((pvz) => pvz.id === 111111)) {
    updatedPVZList.unshift({ id: 111111, name: "ВСЕ" });
  }

  return updatedPVZList;
}

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

const roles = [
  "USER",
  "ADMIN",
  "SORTIROVKA",
  "PVZ",
  "PPVZ",
  "RMANAGER",
  "ADMINISTRATOR",
  "COURIER",
  "DRIVER",
  "SHVEDOVA",
  "OFFICE",
];

const userOptions = [
  { value: "NONE", text: "Не видеть" },
  { value: "READ", text: "Видеть" },
  { value: "WRITE", text: "Редактировать" },
];
</script>

<template>
  <Head>
    <Title>Пользователи</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="table-admin-no-pad">
      <div
        v-if="!isLoading"
        class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5 w-screen"
      >
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
              <h1 class="text-left">Изменение: {{ userData.username }}</h1>
            </div>
          </template>
          <template v-slot:body>
            <div class="text-black max-sm:text-sm">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Имя пользователя</label>
                <UInput
                  color="white"
                  variant="outline"
                  v-model="userData.username"
                  class="w-full"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="role">Роль</label>
                <USelectMenu
                  class="w-full"
                  v-model="userData.role"
                  :options="roles"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="role">ПВЗ</label>
                <USelectMenu
                  v-if="pvz"
                  v-model="userData.PVZ"
                  value-attribute="name"
                  option-attribute="name"
                  :options="allPVZ"
                  multiple
                  placeholder="Выберите ПВЗ"
                  class="w-full"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сортировочный центр</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="name"
                  option-attribute="name"
                  v-model="userData.visibleSC"
                  :options="sortingCenters"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">ПВЗ</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="name"
                  option-attribute="name"
                  v-model="userData.visiblePVZ"
                  :options="pvz"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ячейка (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.cell1"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ячейка (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.cell2"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительно (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.additionally1"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительно (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.additionally2"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительно (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.additionally3"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на СЦ (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.deliveredSC1"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на СЦ (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.deliveredSC2"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на ПВЗ (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.deliveredPVZ1"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Доставлено на ПВЗ (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.deliveredPVZ2"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительный доход (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.deliveredKGT1"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Дополнительный доход (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.deliveredKGT2"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отправка в ПВЗ (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.dispatchPVZ1"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отправка в ПВЗ (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.dispatchPVZ2"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отправка в ПВЗ (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.dispatchPVZ3"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Отсортировано (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.sorted"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Оплачено (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.paid"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Имя (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.name3"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Телефон (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.fromName1"
                  :options="userOptions"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Телефон (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.fromName2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Телефон (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.fromName3"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Выдан клиенту (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.issued1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Выдан клиенту (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.issued2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Аккаунт заказа (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.orderAccount"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Заказано на СЦ (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.orderPVZ1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Заказано на СЦ (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.orderPVZ2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Заказано на СЦ (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.orderPVZ3"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Процент с клиента (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.percentClient1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Процент с клиента (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.percentClient2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Процент с клиента (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.percentClient3"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Примечание (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.notation1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Примечание (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.notation2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell"
                  >Стоимость выкупа товара (Доставка заказов по ШК (QR))
                </label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.priceProgram"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Стоимость выкупа товара (Доставка) </label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.purchaseOfGoods"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Стоимость сайт (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.priceSite"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Предоплата (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.prepayment1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Предоплата (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.prepayment2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Товар (ссылка) (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.productLink1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Маркетплейс (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.productLink2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Название товара (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.productName1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Количество товаров (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.productName2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Данные (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.dataOurRansom"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Данные (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.dataClientRansom"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Данные (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.dataDelivery"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сумма с клиента (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.amountFromClient1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сумма с клиента (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.amountFromClient2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Сумма с клиента (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.amountFromClient3"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ссылка для клиента (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.clientLink1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ссылка для клиента (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.clientLink2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Ссылка для клиента (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.clientLink3"
                  :options="userOptions"
                />
              </div>

              <div v class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Прибыль (доход) (Товары клиентов)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.profit1"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Прибыль (доход) (Доставка заказов по ШК (QR))</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.profit2"
                  :options="userOptions"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="cell">Прибыль (доход) (Доставка)</label>
                <USelectMenu
                  class="w-full"
                  value-attribute="value"
                  option-attribute="text"
                  v-model="userData.profit3"
                  :options="userOptions"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="updateUser"
                >СОХРАНИТЬ</UISaveModalButton
              >
              <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-else-if="user.role === 'USER'">
    <NuxtLayout name="user">
      <h1>
        У вас недостаточно прав на просмотр этой информации. Обратитесь к
        администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
