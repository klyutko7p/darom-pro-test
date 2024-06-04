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

function getAmountToBePaid(flag: string, flagRansom: number): number {
  let amountToPaid = 0;

  const shouldRound = (value: any) => {
    const createdDate = new Date(value.created_at);
    const referenceDate = new Date("2024-06-05T00:00:01");
    return createdDate > referenceDate;
  };

  const roundOrCeil = (num: number) => {
    const lastDigit = num % 10;
    return lastDigit >= 5 ? Math.ceil(num / 10) * 10 : Math.floor(num / 10) * 100;
  };

  if (rows) {
    rows.value.forEach((value: any) => {
      if (value.created_at) {
        const roundFunction = shouldRound(value) ? roundOrCeil : Math.ceil;
        switch (flag) {
          case "NONE":
            if (!value.issued && value.deleted === null) {
              amountToPaid += roundFunction(
                flagRansom === 1 ? value.amountFromClient1 : value.amountFromClient2
              );
            }
            break;
          case "PVZ":
            if (value.deliveredPVZ && !value.issued && value.deleted === null) {
              amountToPaid += roundFunction(
                flagRansom === 1 ? value.amountFromClient1 : value.amountFromClient2
              );
            }
            break;
        }
      }
    });
  }

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

onBeforeMount(async () => {
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
  layout: "client",
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
</script>

<template>
  <Head>
    <Title>Мои заказы</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token" class="mt-10">
      <div
        class="flex items-center justify-between max-sm:flex-col-reverse max-sm:items-start"
      >
        <div class="max-lg:p-3">
          <div class="mb-5 flex items-center gap-3">
            <h1 class="text-xl">
              Телефон: <span class="italic"> {{ user.phoneNumber }} </span>
            </h1>
            <Icon name="material-symbols:contact-phone-rounded" size="24" />
          </div>
          <h1 class="text-xl max-sm:text-base">
            Оставшаяся сумма к оплате:
            <span class="font-bold">
              {{
                roundToNearestTen(getAmountToBePaid("NONE", 1)) +
                roundToNearestTen(getAmountToBePaid("NONE", 2))
              }}
              руб.</span
            >
          </h1>
          <h1 class="text-xl max-sm:text-base">
            Сумма к оплате на выдачу:
            <span class="font-bold"
              >{{
                roundToNearestTen(getAmountToBePaid("PVZ", 1)) +
                roundToNearestTen(getAmountToBePaid("PVZ", 2))
              }}
              руб.</span
            >
          </h1>
          <UIMainButton
            v-if="showReceivedItems"
            class="mt-5"
            @click="disableReceivedItems"
            >Скрыть полученные товары</UIMainButton
          >
          <UIMainButton
            v-if="!showReceivedItems"
            class="mt-5"
            @click="enableReceivedItems"
          >
            Показать полученные товары</UIMainButton
          >
        </div>
        <div class="flex flex-col items-center gap-3 max-lg:items-start mt-3">
          <CodeQR :value="value" class="max-w-[110px] max-h-[100px]" />
        </div>
      </div>

      <SpreadsheetsOrderTable :link="'1'" :rows="copyRowsOurRansom" :user="user" />
      <div class="mt-16 mb-10">
        <SpreadsheetsOrderTable :link="'2'" :rows="copyRowsClientRansom" :user="user" />
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
