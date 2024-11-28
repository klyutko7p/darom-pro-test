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
  copyRowsOurRansom.value = rowsOurRansom.value;
  copyRowsClientRansom.value = rowsClientRansom.value;
}

let phoneNumber = ref("");
let dispatchPVZ = ref("");
let cell = ref("");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();

  rowsOurRansom.value = await storeRansom.getRansomRowsByFromNameWithoutCell(
    user.value.phoneNumber,
    "OurRansom"
  );
  rowsClientRansom.value = await storeRansom.getRansomRowsByFromNameWithoutCell(
    user.value.phoneNumber,
    "ClientRansom"
  );

  rows.value = [...rowsOurRansom.value, ...rowsClientRansom.value];

  if (rows.value) {
    copyRowsOurRansom.value = [...rowsOurRansom.value];
    copyRowsClientRansom.value = [...rowsClientRansom.value];
    if (copyRowsOurRansom.value.length > 0) {
      let ransomRow = copyRowsOurRansom.value;
      phoneNumber.value = copyRowsOurRansom.value[0].fromName;
      dispatchPVZ.value = ransomRow[ransomRow.length - 1].dispatchPVZ;
      cell.value = ransomRow[ransomRow.length - 1].cell;
      value.value = `${dispatchPVZ.value}/${phoneNumber.value}/${cell.value}`;
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
    name: "г. Донецк, ул. Харитоново, 8",
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
];

let isOpenQRModal = ref(false);
function openQRModal() {
  isOpenQRModal.value = true;
  showModal(true);
}

function closeQRModal() {
  isOpenQRModal.value = false;
  showModal(false);
}
</script>

<template>
  <Head>
    <Title>Мои заказы</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token" class="w-screen px-10 max-sm:px-3">
      <div
        class="flex items-center justify-between max-sm:flex-col-reverse max-sm:items-center"
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
          @click="openQRModal"
          class="flex items-center max-sm:flex-col-reverse max-sm:justify-center gap-3 mt-3 bg-gray-50 p-3 shadow-xl border-[1px] rounded-xl hover:opacity-50 duration-200 cursor-pointer"
        >
          <h1 class="max-w-[240px] max-sm:text-center">
            Покажите QR-код, чтобы получить заказ
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
          Оформленные заказы через:
        </span>
        <span class="text-lg">
          Администратора <br />
          Телеграм-бота <br />
          Личный кабинет Darom Pro
        </span>
      </h1>
      <div v-for="pvz in pvzs" class="mt-5">
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

      <h1 class="mt-20 text-xl max-[330px]:text-lg">
        <span
          class="flex items-center gap-3 max-sm:flex-col max-sm:gap-0 max-sm:items-start mb-1"
        >
          <Icon name="mdi:truck-fast" class="text-secondary-color" size="32" />
          Оформленные доставки заказов по
          <!-- <br class="max-[380px]:block hidden" /> -->
          Штрих-коду (QR) через:
        </span>
        <span class="text-lg">
          Администратора <br />
          Телеграм-бота <br />
          Личный кабинет Darom Pro
        </span>
      </h1>
      <div v-for="pvz in pvzs" class="mt-5">
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
              copyRowsClientRansom?.filter((row) => row.dispatchPVZ === pvz.pvz)
            "
            :user="user"
            @showModal="showModal"
            :isShowModalValue="isShowModalValue"
          />
        </div>
      </div>

      <UINewModalClient v-show="isOpenQRModal" @close-modal="closeQRModal">
        <template v-slot:icon-header> </template>
        <template v-slot:header></template>
        <template v-slot:body>
          <div
            class="flex items-center flex-col-reverse justify-center gap-3 mt-3 bg-gray-50 p-3"
          >
            <h1 class="max-w-[240px] max-sm:text-center">
              Покажите QR-код, чтобы получить заказ
            </h1>
            <CodeQR
              :value="value"
              class="max-w-[210px] max-h-[200px] max-sm:mx-auto"
            />
          </div>
        </template>
      </UINewModalClient>
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
