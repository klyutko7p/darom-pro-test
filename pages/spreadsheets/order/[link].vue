<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const route = useRoute();
const router = useRouter();
let link = route.params.link;
link = link.toString();

let isLoading = ref(false);

let user = ref({} as User);
let rows = ref<Array<IOurRansom | IClientRansom | IDelivery>>();
let copyRows = ref<Array<IOurRansom | IClientRansom | IDelivery>>();

function getAmountToBePaid(flag: string) {
  let amountToPaid = 0;
  if (link.startsWith("1")) {
    if (rows.value && flag === "NONE") {
      amountToPaid = rows.value
        .filter((value) => !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient1 / 10) * 10, 0);
    } else if (rows.value && flag === "PVZ") {
      amountToPaid = rows.value
        .filter((value) => value.deliveredPVZ && !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient1 / 10) * 10, 0);
    }
  } else if (link.startsWith("2")) {
    if (rows.value && flag === "NONE") {
      amountToPaid = rows.value
        .filter((value) => !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient2 / 10) * 10, 0);
    } else if (rows.value && flag === "PVZ") {
      amountToPaid = rows.value
        .filter((value) => value.deliveredPVZ && !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient2 / 10) * 10, 0);
    }
  } else if (link.startsWith("3")) {
    if (rows.value && flag === "NONE") {
      amountToPaid = rows.value
        .filter((value) => !value.paid && value.deleted === null)
        .reduce((acc, value) => acc + value.amountFromClient3, 0);
    }
  }
  return amountToPaid;
}

function getAmountFromMonthDelivery() {
  let amountToPaid = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() + 1);
  if (link.startsWith("3")) {
    if (rows.value) {
      amountToPaid = rows.value
        .filter((value) => {
          const paidDate = new Date(value.paid);
          return (
            paidDate >= thirtyDaysAgo &&
            paidDate <= currentDate &&
            value.nameOfAction === "Доставка"
          );
        })
        .reduce((acc, value) => acc + value.purchaseOfGoods, 0);
    }
  }
  return amountToPaid;
}

function getAmountFromMonthSorting() {
  let amountToPaid = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() + 1);
  if (link.startsWith("3")) {
    if (rows.value) {
      amountToPaid = rows.value
        .filter((value) => {
          const paidDate = new Date(value.paid);
          return (
            paidDate >= thirtyDaysAgo &&
            paidDate <= currentDate &&
            value.nameOfAction === "Сортировка"
          );
        })
        .reduce((acc, value) => acc + value.purchaseOfGoods, 0);
    }
  }
  return amountToPaid;
}

let showReceivedItems = ref(true);

function disableReceivedItems() {
  showReceivedItems.value = false;
  copyRows.value = rows.value?.filter((value) => !value.issued && value.deleted === null);
}

function enableReceivedItems() {
  showReceivedItems.value = true;
  copyRows.value = rows.value;
}

let phoneNumber = ref("");
let dispatchPVZ = ref("");
let cell = ref("");

onMounted(async () => {
  focusInput();
  isLoading.value = true;
  user.value = await storeUsers.getUser();

  if (link.startsWith("1")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "OurRansom");
  } else if (link.startsWith("2")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "ClientRansom");
  } else if (link.startsWith("3")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "Delivery");
  }

  if (rows.value) {
    copyRows.value = [...rows.value];
    let ransomRow = copyRows.value?.filter((row) => row.deleted === null);
    phoneNumber.value = copyRows.value[0].fromName;
    dispatchPVZ.value = ransomRow[0].dispatchPVZ;
    console.log(dispatchPVZ.value);
    cell.value = ransomRow[0].cell;
    value.value = `${dispatchPVZ.value}/${phoneNumber.value}/${cell.value}`;
    console.log(value.value);
  }
  disableReceivedItems();
  isLoading.value = false;
});

const myInput = ref(null);
let isScanActive = ref(false);
let scanStringItem = ref("");
let timeoutId: ReturnType<typeof setTimeout> | null = null;

function focusInput() {
  myInput.value.focus();
  isScanActive.value = true;
}

function getNumber(phoneNumberData: string) {
  return phoneNumberData.slice(-4);
}

function scanItem() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(async () => {
    let scannedLink = scanStringItem.value.trim();
    window.location.href = 'https://soft-praline-633324.netlify.app/spreadsheets/our-ransom/ПВЗ' + scannedLink
    scanStringItem.value = "";
  }, 300);
}

let value = ref("");
</script>

<template>
  <Head>
    <Title>Заказ - {{ route.params.link }}</Title>
  </Head>
  <div v-if="!isLoading">
    <div class="mt-5 max-lg:mt-0">
      <div
        class="max-lg:px-3 flex justify-between items-start max-lg:flex-col-reverse max-lg:gap-3"
      >
        <div>
          <h1 class="text-2xl overflow-auto">
            Информация о заказе:
            <span class="uppercase">{{ route.params.link }}</span>
          </h1>
          <div class="mb-5 flex items-center gap-3">
            <h1 class="text-xl">
              Телефон: <span class="italic"> {{ getNumber(phoneNumber) }} </span>
            </h1>
            <Icon name="material-symbols:contact-phone-rounded" size="24" />
          </div>
          <h1 class="text-xl" v-if="!link.startsWith('3')">
            Оставшаяся сумма к оплате:
            <span class="font-bold">
              {{ Math.ceil(getAmountToBePaid("NONE") / 10) * 10 }} руб.</span
            >
          </h1>
          <h1 class="text-xl" v-if="link.startsWith('3')">
            Оставшаяся сумма к оплате:
            <span class="font-bold">{{ getAmountToBePaid("NONE") }} руб.</span>
          </h1>
          <h1 class="text-xl" v-if="!link.startsWith('3')">
            Сумма к оплате на выдачу:
            <span class="font-bold"
              >{{ Math.ceil(getAmountToBePaid("PVZ") / 10) * 10 }} руб.</span
            >
          </h1>
          <div
            class="text-xl max-sm:text-sm flex justify-end items-end flex-col gap-1 mt-7"
            v-if="link.startsWith('3')"
          >
            Сумма выкупов товаров за 30 дней
            <br />
            <h1>
              Доставка =
              <span class="font-bold">{{ getAmountFromMonthDelivery() }} руб.</span>
            </h1>
            <h1>
              Сортировка =
              <span class="font-bold">{{ getAmountFromMonthSorting() }} руб.</span>
            </h1>
          </div>
          <UIMainButton
            v-if="showReceivedItems && !link.startsWith('3')"
            class="mt-5"
            @click="disableReceivedItems"
            >Скрыть полученные товары</UIMainButton
          >
          <UIMainButton
            v-if="!showReceivedItems && !link.startsWith('3')"
            class="mt-5"
            @click="enableReceivedItems"
          >
            Показать полученные товары</UIMainButton
          >
        </div>
        <div class="flex flex-col items-center gap-3 max-lg:items-start mt-3">
          <CodeQR :value="value" class="max-w-[110px] max-h-[100px]" />
          <UIMainButton @click="focusInput">СКАНИРОВАТЬ</UIMainButton>
          <input
            class="opacity-0"
            ref="myInput"
            autofocus
            v-model="scanStringItem"
            @input="scanItem"
          />
        </div>
      </div>
      <SpreadsheetsOrderTable :link="link" :rows="copyRows" :user="user" />
    </div>
  </div>
  <div v-else>
    <UISpinner />
  </div>
</template>
