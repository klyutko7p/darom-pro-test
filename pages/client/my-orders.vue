<script setup lang="ts">
import Cookies from "js-cookie";
const storeClients = useClientsStore();
const storeRansom = useRansomStore();
const router = useRouter();
const route = useRoute();

let isLoading = ref(false);

let user = ref({} as Client);
let rowsOurRansom = ref<Array<IOurRansom>>([]);
let rowsClientRansom = ref<Array<IClientRansom>>([]);
let rows = ref<Array<any>>([]);
let copyRowsOurRansom = ref<Array<IOurRansom>>();
let copyRowsClientRansom = ref<Array<IClientRansom>>();

function getAmountToBePaid(flag: string): number {
  let amountToPaid = 0;

  let copyRows = rows.value.filter((row) => row.deliveredSC);

  const shouldRound = (value: any) => {
    const createdDate = new Date(value.created_at);
    const referenceDate = new Date("2024-06-05T00:00:01");
    return createdDate > referenceDate;
  };

  const roundOrCeil = (num: number) => {
    const lastDigit = num % 10;
    return lastDigit >= 5
      ? Math.ceil(num / 10) * 10
      : Math.floor(num / 10) * 10;
  };

  const ceilMath = (num: number) => {
    return Math.ceil(num / 10) * 10;
  };

  copyRows.forEach((value: any) => {
    if (value.created_at) {
      const roundFunction = shouldRound(value) ? roundOrCeil : ceilMath;
      switch (flag) {
        case "NONE1":
          if (!value.issued && value.deleted === null) {
            if (!value.amountFromClient1) {
              amountToPaid += 0;
            } else {
              amountToPaid += roundFunction(value.amountFromClient1);
            }
          }
          break;
        case "PVZ1":
          if (value.deliveredPVZ && !value.issued && value.deleted === null) {
            if (!value.amountFromClient1) {
              amountToPaid += 0;
            } else {
              amountToPaid += roundFunction(value.amountFromClient1);
            }
          }
          break;
        case "NONE2":
          if (!value.issued && value.deleted === null) {
            if (!value.amountFromClient2) {
              amountToPaid += 0;
            } else {
              amountToPaid += roundFunction(value.amountFromClient2);
            }
          }
          break;
        case "PVZ2":
          if (value.deliveredPVZ && !value.issued && value.deleted === null) {
            if (!value.amountFromClient2) {
              amountToPaid += 0;
            } else {
              amountToPaid += roundFunction(value.amountFromClient2);
            }
          }
          break;
        case "NONE3":
          if (!value.paid && value.deleted === null) {
            amountToPaid += value.amountFromClient3;
          }
          break;
      }
    }
  });

  return amountToPaid;
}

let showReceivedItems = ref(true);

function disableReceivedItems() {
  showReceivedItems.value = false;
  copyRowsOurRansom.value = rowsOurRansom.value?.filter(
    (value) => !value.issued && value.deleted === null
  );
  copyRowsClientRansom.value = rowsClientRansom.value?.filter(
    (value) => !value.issued && value.deleted === null
  );
}

function enableReceivedItems() {
  showReceivedItems.value = true;
  copyRowsOurRansom.value = rowsOurRansom.value?.filter(
    (value) => value.issued
  );
  copyRowsClientRansom.value = rowsClientRansom.value?.filter(
    (value) => value.issued
  );
}

let phoneNumber = ref("");
let dispatchPVZ = ref("");
let cell = ref("");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();

  rowsOurRansom.value =
    await storeRansom.getRansomRowsByFromNameWithoutCellOurRansom(
      user.value.phoneNumber
    );
  rowsClientRansom.value =
    await storeRansom.getRansomRowsByFromNameWithoutCellClientRansom(
      user.value.phoneNumber
    );

  rows.value = [...rowsOurRansom.value, ...rowsClientRansom.value];

  if (rows.value) {
    copyRowsOurRansom.value = [...rowsOurRansom.value];
    copyRowsClientRansom.value = [...rowsClientRansom.value];

    if (copyRowsOurRansom.value.length) {
      let ransomRow = copyRowsOurRansom.value;
      ransomRow = ransomRow.filter((row) => !row.deleted && !row.issued);
      phoneNumber.value = copyRowsOurRansom.value[0].fromName;
      if (ransomRow.length) {
        dispatchPVZ.value = ransomRow[0].dispatchPVZ;
        cell.value = ransomRow[0].cell;
        value.value = `${dispatchPVZ.value}/${phoneNumber.value}/${cell.value}`;
      }
    }

    if (copyRowsClientRansom.value.length) {
      let ransomRow = copyRowsClientRansom.value;
      ransomRow = ransomRow.filter((row) => !row.deleted && !row.issued);
      phoneNumber.value = copyRowsClientRansom.value[0].fromName;

      if (ransomRow.length) {
        dispatchPVZ.value = ransomRow[0].dispatchPVZ;
        cell.value = ransomRow[0].cell;
        value2.value = `${dispatchPVZ.value}/${phoneNumber.value}/${cell.value}`;
      }
    }
  }
  disableReceivedItems();
  isLoading.value = false;
});

function getNumber(phoneNumberData: string) {
  return phoneNumberData.slice(-4);
}

definePageMeta({
  layout: "client-no-pad",
});

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

const token = Cookies.get("token");
let value = ref("");
let value2 = ref("");

let isShowModalValue = ref(false);
function showModal(isShow: boolean) {
  isShowModalValue.value = isShow;
}

const pvzs = [
  {
    pvz: "ПВЗ_1",
    name: "ул. Антропова 16",
  },
  {
    pvz: "ПВЗ_2",
    name: "ул. Харитоново, 8",
  },
  {
    pvz: "ПВЗ_3",
    name: "ул. Палладина, 16",
  },
  {
    pvz: "ПВЗ_4",
    name: "ул. Нартова, 1",
  },
  {
    pvz: "ППВЗ_5",
    name: "ул. Дудинская, д. 4, кв. 7",
  },
  {
    pvz: "ППВЗ_7",
    name: "ул. Жебелева, д. 7",
  },
  {
    pvz: "ПВЗ_8",
    name: "ул. Макара Мазая, 37А",
  },
  {
    pvz: "ПВЗ_10",
    name: "ул. Азовской Военной Флотилии, 2",
  },
  {
    pvz: "ПВЗ_11",
    name: "ул. Межевая",
  },
  {
    pvz: "ППВЗ_12",
    name: "ул. 8 Марта, 77",
  },
  {
    pvz: "НаДом",
    name: "Домой",
  },
];

let isOpenQRModal = ref(false);
let flag = ref("");
function openQRModal(flagData: string) {
  isOpenQRModal.value = true;
  showModal(true);
  flag.value = flagData;
}

function closeQRModal() {
  isOpenQRModal.value = false;
  showModal(false);
}

let isOpenModalNoRegistration = ref(true);

function signOut() {
  storeClients.signOut();
}
</script>

<template>
  <Head>
    <Title>Мои заказы</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token" class="w-screen px-10 max-sm:px-3">
      <div v-if="user.phoneNumber !== '+70000000001'">
        <div
          class="flex items-center justify-between max-sm:flex-col max-sm:items-center"
        >
          <div class="max-lg:p-3 w-full mt-5">
            <div class="mb-5 flex items-center gap-3">
              <h1 class="text-xl">
                Телефон: <span class="italic"> {{ user.phoneNumber }} </span>
              </h1>
              <Icon name="material-symbols:contact-phone-rounded" size="24" />
            </div>
            <h1 class="text-xl max-sm:text-base">
              Оставшаяся сумма к оплате:
              <span class="font-bold">
                {{ getAmountToBePaid("NONE1") + getAmountToBePaid("NONE2") }}
                руб.</span
              >
            </h1>
            <h1 class="text-xl max-sm:text-base">
              Сумма к оплате на выдачу:
              <span class="font-bold"
                >{{
                  getAmountToBePaid("PVZ1") + getAmountToBePaid("PVZ2")
                }}
                руб.</span
              >
            </h1>
            <UIMainButton
              v-if="showReceivedItems"
              class="mt-5"
              @click="disableReceivedItems"
              >Скрыть доставленные заказы</UIMainButton
            >
            <UIMainButton
              v-if="!showReceivedItems"
              class="mt-5"
              @click="enableReceivedItems"
            >
              Показать доставленные заказы</UIMainButton
            >
          </div>
          <div
            @click="openQRModal('OurRansom')"
            class="flex items-center max-sm:flex-col-reverse max-sm:justify-center gap-3 mt-3 bg-gray-50 p-3 shadow-xl border-[1px] rounded-xl hover:opacity-50 duration-200 cursor-pointer"
          >
            <h1 class="max-w-[240px] max-sm:text-center">
              Покажите QR-код, чтобы получить заказы
            </h1>
            <CodeQR
              :value="value"
              class="max-w-[110px] max-h-[100px] max-sm:mx-auto"
            />
          </div>
        </div>

        <h1 class="mt-5 text-xl max-[330px]:text-lg">
          <span
            class="flex items-center gap-3 max-sm:flex-col max-sm:gap-0 max-sm:items-start mb-1"
          >
            <Icon
              class="text-orange-500"
              name="solar:box-bold-duotone"
              size="32"
            />
            Оформленные заказы
          </span>
        </h1>
        <div v-if="copyRowsOurRansom?.length" v-for="pvz in pvzs" class="mt-5">
          <div
            class="border-[1px] shadow-xl rounded-lg bg-white max-sm:border-0 max-sm:shadow-none"
            v-if="
              copyRowsOurRansom?.filter((row) => row.dispatchPVZ === pvz.pvz)
                .length
            "
          >
            <div class="px-5 py-3 max-sm:px-0">
              <div class="flex items-center mb-1 gap-3 text-gray-400">
                <Icon name="i-heroicons-building-storefront-solid" size="24" />
                <h1 class="text-sm font-semibold tracking-widest">
                  ПУНКТ ВЫДАЧИ ЗАКАЗОВ
                </h1>
              </div>
              <h1>{{ pvz.name }}</h1>
            </div>
            <SpreadsheetsOrderTable
              :link="'1'"
              :rows="
                copyRowsOurRansom?.filter((row) => row.dispatchPVZ === pvz.pvz)
              "
              :user="user"
              @showModal="showModal"
              :isShowModalValue="isShowModalValue"
            />
          </div>
        </div>
        <div
          class="bg-gray-100 text-center py-20 mt-5 font-semibold text-xl rounded-xl"
          v-else
        >
          <h1>Список пуст</h1>
        </div>

        <div
          class="flex items-center justify-between max-sm:flex-col-reverse max-sm:items-center"
        >
          <div class="max-lg:p-3 w-full mt-5 opacity-0 max-sm:hidden">
            <div class="mb-5 flex items-center gap-3">
              <h1 class="text-xl">
                Телефон: <span class="italic"> {{ user.phoneNumber }} </span>
              </h1>
              <Icon name="material-symbols:contact-phone-rounded" size="24" />
            </div>
            <h1 class="text-xl max-sm:text-base">
              Оставшаяся сумма к оплате:
              <span class="font-bold">
                {{ getAmountToBePaid("NONE1") + getAmountToBePaid("NONE2") }}
                руб.</span
              >
            </h1>
            <h1 class="text-xl max-sm:text-base">
              Сумма к оплате на выдачу:
              <span class="font-bold"
                >{{
                  getAmountToBePaid("PVZ1") + getAmountToBePaid("PVZ2")
                }}
                руб.</span
              >
            </h1>
            <UIMainButton
              v-if="showReceivedItems"
              class="mt-5"
              @click="disableReceivedItems"
              >Скрыть доставленные заказы</UIMainButton
            >
            <UIMainButton
              v-if="!showReceivedItems"
              class="mt-5"
              @click="enableReceivedItems"
            >
              Показать доставленные заказы</UIMainButton
            >
          </div>
          <div
            @click="openQRModal('ClientRansom')"
            class="flex items-center max-sm:flex-col-reverse max-sm:justify-center gap-3 mt-3 bg-gray-50 p-3 shadow-xl border-[1px] rounded-xl hover:opacity-50 duration-200 cursor-pointer max-sm:mt-10"
          >
            <h1 class="max-w-[240px] max-sm:text-center">
              Покажите QR-код, чтобы получить оформленные доставки
            </h1>
            <CodeQR
              :value="value2"
              class="max-w-[110px] max-h-[100px] max-sm:mx-auto"
            />
          </div>
        </div>

        <h1 class="mt-20 text-xl max-[330px]:text-lg">
          <span
            class="flex items-center gap-3 max-sm:flex-col max-sm:gap-0 max-sm:items-start mb-1"
          >
            <Icon
              name="mdi:truck-fast"
              class="text-secondary-color"
              size="32"
            />
            Оформленные доставки заказов по Штрих-коду (QR)
          </span>
        </h1>
        <div
          v-if="copyRowsClientRansom?.length"
          v-for="pvz in pvzs"
          class="mt-5"
        >
          <div
            class="border-[1px] shadow-xl rounded-lg bg-white max-sm:border-0 max-sm:shadow-none"
            v-if="
              copyRowsClientRansom?.filter((row) => row.dispatchPVZ === pvz.pvz)
                .length
            "
          >
            <div class="px-5 py-3 max-sm:px-0">
              <div class="flex items-center mb-1 gap-3 text-gray-400">
                <Icon name="i-heroicons-building-storefront-solid" size="24" />
                <h1 class="text-sm font-semibold tracking-widest">
                  ПУНКТ ВЫДАЧИ ЗАКАЗОВ
                </h1>
              </div>
              <h1>{{ pvz.name }}</h1>
            </div>
            <SpreadsheetsOrderTable
              :link="'2'"
              :rows="
                copyRowsClientRansom?.filter(
                  (row) => row.dispatchPVZ === pvz.pvz
                )
              "
              :user="user"
              @showModal="showModal"
              :isShowModalValue="isShowModalValue"
            />
          </div>
        </div>

        <div
          class="bg-gray-100 text-center py-20 mb-5 mt-5 font-semibold text-xl rounded-xl"
          v-else
        >
          <h1>Список пуст</h1>
        </div>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isOpenQRModal"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                ></h3>
                <Icon
                  @click="closeQRModal"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div
              v-if="flag === 'OurRansom'"
              class="flex items-center text-center flex-col-reverse justify-center gap-3 mt-3 p-3"
            >
              <h1 class="max-w-[240px] max-sm:text-center">
                Покажите QR-код, чтобы получить оформленные <br />
                заказы
              </h1>
              <CodeQR
                :value="value"
                class="max-w-[210px] max-h-[200px] max-sm:mx-auto"
              />
            </div>

            <div
              v-if="flag === 'ClientRansom'"
              class="flex items-center text-center flex-col-reverse justify-center gap-3 mt-3 p-3"
            >
              <h1 class="max-w-[240px] max-sm:text-center">
                Покажите QR-код, чтобы получить оформленные доставки заказов
              </h1>
              <CodeQR
                :value="value2"
                class="max-w-[210px] max-h-[200px] max-sm:mx-auto"
              />
            </div>
          </UCard>
        </UModal>
      </div>

      <div v-else>
        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isOpenModalNoRegistration"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Авторизация
                </h3>
                <Icon
                  @click="router.push('/client/main?notification=false')"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div class="text-center">
              <h1>
                После входа вам будет доступен полный функционал личного
                кабинета!
              </h1>
              <div class="max-md:flex items-center justify-center">
                <UButton
                  @click="router.push('/auth/client')"
                  class="my-3 font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
              </div>
            </div>
          </UCard>
        </UModal>
      </div>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <div class="w-screen">
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>
</template>
