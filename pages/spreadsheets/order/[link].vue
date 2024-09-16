<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const route = useRoute();
const router = useRouter();
let link = route.params.link as string;

const toast = useToast();

let isLoading = ref(false);

let user = ref({} as User);
let rows = ref<Array<any>>([]);
let copyRows = ref<Array<any>>([]);

function getAmountToBePaid(flag: string): number {
  let amountToPaid = 0;

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

  rows.value.forEach((value: any) => {
    if (value.created_at) {
      const roundFunction = shouldRound(value) ? roundOrCeil : ceilMath;
      switch (flag) {
        case "NONE1":
          if (!value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient1);
          }
          break;
        case "PVZ1":
          if (value.deliveredPVZ && !value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient1);
          }
          break;
        case "NONE2":
          if (!value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient2);
          }
          break;
        case "PVZ2":
          if (value.deliveredPVZ && !value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient2);
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

function getAmountFromMonthDelivery() {
  let amountToPaid = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(
    currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
  );
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() + 1);
  if (typeof link === "string") {
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
}

function getAmountFromMonthSorting() {
  let amountToPaid = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(
    currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
  );
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() + 1);
  if (typeof link === "string") {
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
  }

  return amountToPaid;
}

let showReceivedItems = ref(true);

function disableReceivedItems() {
  showReceivedItems.value = false;
  copyRows.value = rows.value?.filter(
    (value) => !value.issued && value.deleted === null
  );
}

function enableReceivedItems() {
  showReceivedItems.value = true;
  copyRows.value = rows.value;
}

let phoneNumber = ref("");
let dispatchPVZ = ref("");
let cell = ref("");
const token = Cookies.get("token");

onMounted(async () => {
  if (window.location.href.includes("soft-praline-633324.netlify.app")) {
    window.location.href = `https://darom.pro${route.fullPath}`;
  }

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
    let ransomRow = copyRows.value;
    phoneNumber.value = copyRows.value[0].fromName;
    dispatchPVZ.value = ransomRow[ransomRow.length - 1].dispatchPVZ;
    cell.value = ransomRow[ransomRow.length - 1].cell;
    value.value = `${dispatchPVZ.value}/${phoneNumber.value}/${cell.value}`;
  }
  disableReceivedItems();

  await createModalQR();
  isLoading.value = false;

  const someRowsPaidNull = rows.value.some((row) => row.paid === null);

  if (link.startsWith("3") && someRowsPaidNull) {
    await checkPayment();
  }
});

function getNumber(phoneNumberData: string) {
  return phoneNumberData.slice(-4);
}

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

const storeQR = useQRStore();
const qrBody = ref<QRBodyLink>({} as QRBodyLink);
const qrBodyInfo = ref<QRBodyInfo>({} as QRBodyInfo);

async function createModalQR() {
  qrBody.value = {} as QRBodyLink;
  qrBodyInfo.value = {} as QRBodyInfo;
  if (getAmountToBePaid("NONE3") > 0) {
    let ransomRow = copyRows.value;
    let nameOfWholesaler = ransomRow[ransomRow.length - 1].name;
    qrBodyInfo.value = await storeQR.createQRCode(
      getAmountToBePaid("NONE3"),
      `Онлайн оплата доставки, ${nameOfWholesaler}`
    );
    qrBody.value = await storeQR.getQRCode(qrBodyInfo.value.Data.qrcId);
  }
}

let isOpenModalQR = ref(false);
let isGeneratedQR = ref(false);
let isOpenModalStatus = ref(false);
const paymentStatusMessage = ref<string>("");
let intervalId = ref();

async function updateDeliveryRows() {
  let ransomRow = copyRows.value;
  let nameOfWholesaler = ransomRow[ransomRow.length - 1].name;
  let rowsWithNoPaid = copyRows.value.filter((row) => !row.paid);
  let ids = rowsWithNoPaid.map((row) => row.id);
  isLoading.value = true;
  await storeRansom.updateDeliveryRowsStatus(
    ids,
    "paid1",
    "Delivery",
    nameOfWholesaler
  );
  rows.value = await storeRansom.getRansomRowsByLink(link, "Delivery");

  if (rows.value) {
    copyRows.value = [...rows.value];
    let ransomRow = copyRows.value;
    phoneNumber.value = copyRows.value[0].fromName;
    dispatchPVZ.value = ransomRow[ransomRow.length - 1].dispatchPVZ;
    cell.value = ransomRow[ransomRow.length - 1].cell;
    value.value = `${dispatchPVZ.value}/${phoneNumber.value}/${cell.value}`;
  }

  disableReceivedItems();
  isLoading.value = false;
}

async function checkPaymentStatus(qrcId: string) {
  const interval = 5000;

  intervalId.value = setInterval(async () => {
    try {
      let paymentData = (await storeQR.getPaymentStatusQR(
        qrcId
      )) as QRPaymentStatus;

      if (
        paymentData.Data &&
        paymentData.Data.paymentList &&
        paymentData.Data.paymentList.length > 0
      ) {
        const status = paymentData.Data.paymentList[0].status;
        paymentStatusMessage.value = status;

        if (status === "Accepted") {
          toast.success("Оплата прошла успешно!");
          await updateDeliveryRows();
          clearInterval(intervalId.value);
        } else if (status === "Rejected") {
          toast.error("Оплата была отклонена. Попробуйте ещё раз!");
          clearInterval(intervalId.value);
        }
      } else {
        console.error("Статус платежа не найден или не существует.");
      }
    } catch (error) {
      console.error("Ошибка при получении статуса платежа:", error);
      clearInterval(intervalId.value);
    }
  }, interval);
}

async function checkPayment() {
  await checkPaymentStatus(qrBodyInfo.value.Data.qrcId);
}

let value = ref("");
let isShowModalValue = ref(false);
function showModal(isShow: boolean) {
  isShowModalValue.value = isShow;
}
</script>

<template>
  <Head>
    <Title>Заказ - {{ route.params.link }}</Title>
  </Head>
  <div v-if="!isLoading">
    <div class="mt-5 max-lg:mt-0">
      <div
        class="flex items-center justify-between max-sm:flex-col-reverse max-sm:items-center mt-10 max-sm:mt-0 max-sm:px-5"
      >
        <div class="w-full">
          <div class="flex items-center justify-between max-lg:flex-col-reverse max-lg:items-start max-lg:gap-5">
            <div>
              <h1 class="text-2xl overflow-auto">Информация о заказе</h1>
              <div class="mb-5 flex items-center gap-3">
                <h1 class="text-xl">
                  Телефон:
                  <span class="italic"> {{ getNumber(phoneNumber) }} </span>
                </h1>
                <Icon name="material-symbols:contact-phone-rounded" size="24" />
              </div>
              <h1
                class="text-xl"
                v-if="!link.startsWith('3') && !link.startsWith('2')"
              >
                Оставшаяся сумма к оплате:
                <span class="font-bold">
                  {{ getAmountToBePaid("NONE1") }} руб.</span
                >
              </h1>
              <h1
                class="text-xl"
                v-if="!link.startsWith('3') && !link.startsWith('1')"
              >
                Оставшаяся сумма к оплате:
                <span class="font-bold">
                  {{ getAmountToBePaid("NONE2") }} руб.</span
                >
              </h1>
              <h1 class="text-xl" v-if="link.startsWith('3')">
                Оставшаяся сумма к оплате:
                <span class="font-bold"
                  >{{ getAmountToBePaid("NONE3") }} руб.</span
                >
              </h1>
              <div
                v-if="link.startsWith('3') && getAmountToBePaid('NONE3') > 0"
                class="flex items-center gap-5 mt-3 border-2 border-dashed border-black p-3 max-w-[450px]"
              >
                <CodeQR
                  :value="qrBody.Data?.payload"
                  class="max-w-[200px] max-h-[200px] mt-1"
                />
                <div class="text-center">
                  <h1 class="text-xl italic mb-1">
                    QR-код для оплаты <br />
                    за доставку
                  </h1>
                  <a
                    :href="qrBody.Data?.payload"
                    class="text-secondary-color underline font-bold"
                    >ССЫЛКА НА ОПЛАТУ</a
                  >
                </div>
              </div>
              <h1
                class="text-xl"
                v-if="!link.startsWith('3') && !link.startsWith('2')"
              >
                Сумма к оплате на выдачу:
                <span class="font-bold"
                  >{{ getAmountToBePaid("PVZ1") }} руб.</span
                >
              </h1>
              <h1
                class="text-xl"
                v-if="!link.startsWith('3') && !link.startsWith('1')"
              >
                Сумма к оплате на выдачу:
                <span class="font-bold"
                  >{{ roundToNearestTen(getAmountToBePaid("PVZ2")) }} руб.</span
                >
              </h1>
            </div>
            <div class="flex items-center justify-between mt-7">
              <div
                class="flex items-center max-sm:flex-col-reverse max-sm:justify-center gap-3 mt-3 bg-gray-50 p-3 shadow-inner rounded-xl"
              >
                <h1 class="max-w-[240px] max-sm:text-center">
                  Покажите QR-код, чтобы получить заказ
                </h1>
                <CodeQR
                  :value="value"
                  class="max-w-[110px] max-h-[100px] max-sm:mx-auto"
                />
              </div>
              <div
                class="text-xl max-sm:text-sm flex justify-end items-end flex-col gap-1"
                v-if="link.startsWith('3')"
              >
                Сумма выкупа товаров за 30 дней
                <br />
                <h1>
                  Доставка =
                  <span class="font-bold"
                    >{{ getAmountFromMonthDelivery() }} руб.</span
                  >
                </h1>
                <h1>
                  Сортировка =
                  <span class="font-bold"
                    >{{ getAmountFromMonthSorting() }} руб.</span
                  >
                </h1>
              </div>
            </div>
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
      </div>
      <SpreadsheetsOrderTable
        @showModal="showModal"
        :isShowModalValue="isShowModalValue"
        :link="link"
        :rows="copyRows"
        :user="user"
      />
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
