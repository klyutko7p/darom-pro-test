<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();

const toast = useToast();
const phoneNumber = ref("+7");
const phoneNumberTelegram = ref("+7");
const password = ref("");
const message = ref("");

let isLoading = ref(false);
let isForeignDevice = ref(false);

async function signIn() {
  message.value = "";
  isLoading.value = true;
  message.value = await storeClients.signIn(
    phoneNumber.value.trim(),
    password.value.trim(),
    isForeignDevice.value
  );
  isLoading.value = false;
}

async function signInNoRegistration() {
  message.value = "";
  isLoading.value = true;
  message.value = await storeClients.signIn(
    "+70000000001",
    "001001",
    isForeignDevice.value
  );
  isLoading.value = false;
}

async function signInTelegram() {
  isLoading.value = true;
  await storeClients.signInTelegram(phoneNumberTelegram.value.trim());
  isLoading.value = false;
}

let user = ref({} as User);
let code = ref("");
const token = Cookies.get("token");

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;

  if (route.query.phone) {
    phoneNumberTelegram.value = route.query.phone as string;
    isDisabledButtonInsertCode.value = true;
  }

  if (route.query.code) {
    isAuthInsertCode.value = true;
    isDisabledButtonInsertCode.value = true;
  }

  if (token && user.value.role === "ADMIN") {
    router.push("/admin/main");
  } else if (token && user.value.role === "USER") {
    router.push("/user/main");
  } else if (token && user.value.role === "CLIENT") {
    router.push("/client/main");
  }
});

function generateRandomFiveDigitNumber(): string {
  const min = 10000;
  const max = 99999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

function generateRandomFiveDigitNumberEncrypt() {
  const min = 10000;
  const max = 99999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  let code = randomNumber.toString();
  let encryptCode = storeClients.encryptCode(code);
  return { code, encryptCode };
}

let originallyConfirmationCode = ref("");
let isShowFirstConfirmationModal = ref(false);
let isShowSecondConfirmationModal = ref(false);
let isShowThirdConfirmationModal = ref(false);

const isButtonDisabled = ref(false);
const attempts = ref(0);
const isBlocked = ref(false);
const blockDuration = ref(0);
let blockInterval: NodeJS.Timeout | null = null;
let phoneNumberData = ref("+7");

async function validatePhone() {
  if (phoneNumberData.value.length < 11) {
    toast.error("Неправильный ввод номера телефона");
    return;
  }

  if (phoneNumberData.value.length > 12) {
    toast.error("Неправильный ввод номера телефона");
    return;
  }

  if (!phoneNumberData.value.startsWith("+7")) {
    toast.error('Номер телефона должен начинаться с "+7"');
    return;
  }

  if (phoneNumberData.value.trim() === "") {
    toast.error("Пожалуйста, введите свой номер телефона");
    return;
  }

  isLoading.value = true;
  let client = await storeClients.getClientPhone(phoneNumberData.value);
  isLoading.value = false;

  if (client) {
    if (isBlocked.value) return;

    if (attempts.value >= 2) {
      blockForFifteenMinutes();
      toast.error(
        "Вам на 15 минут заблокирован доступ к восстановлению пароля. Попробуйте восстановить пароль в следующий раз!"
      );
    } else {
      isLoading.value = true;
      originallyConfirmationCode.value = generateRandomFiveDigitNumber();
      disableButtonForOneMinute();
      await storeClients.sendMessage(
        phoneNumberData.value,
        originallyConfirmationCode.value
      );
      isShowFirstConfirmationModal.value = false;
      isShowSecondConfirmationModal.value = true;
      attempts.value++;
      isLoading.value = false;
    }
  } else {
    toast.error("Вы не зарегистрированы! Сначала пройдите регистрацию");
  }
}

let isTelegramConfirm = ref(false);
async function validatePhoneTelegram() {
  isTelegramConfirm.value = true;
  isLoading.value = true;
  let client = await storeClients.getClientPhone(phoneNumberData.value);
  isLoading.value = false;
  if (client) {
    const phoneNumber = phoneNumberData.value.slice(2);
    let { code, encryptCode } = generateRandomFiveDigitNumberEncrypt();
    originallyConfirmationCode.value = code;
    isShowFirstConfirmationModal.value = false;
    isShowSecondConfirmationModal.value = true;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const url = `https://t.me/darom_pro_bot?start=${phoneNumber}and${encryptCode}`;

    if (isAndroid) {
      window.open(url, "_blank");
    } else if (isIOS) {
      window.open(url, "_top");
    } else {
      window.open(url, "_blank");
    }
  } else {
    toast.error("Вы не зарегистрированы! Сначала пройдите регистрацию");
  }
}

const disableButtonForOneMinute = () => {
  isButtonDisabled.value = true;
  blockDuration.value = 90;

  if (blockInterval) clearInterval(blockInterval);

  blockInterval = setInterval(() => {
    blockDuration.value--;
    if (blockDuration.value <= 0) {
      clearInterval(blockInterval!);
      isButtonDisabled.value = false;
    }
  }, 1000);
};

const blockForFifteenMinutes = () => {
  isBlocked.value = true;
  blockDuration.value = 900;

  saveBlockState();

  if (blockInterval) clearInterval(blockInterval);

  blockInterval = setInterval(() => {
    blockDuration.value--;
    saveBlockState();
    if (blockDuration.value <= 0) {
      clearInterval(blockInterval!);
      isBlocked.value = false;
      attempts.value = 0;
      localStorage.removeItem("blockStateAuth");
    }
  }, 1000);
};

const saveBlockState = () => {
  localStorage.setItem(
    "blockStateAuth",
    JSON.stringify({
      blockDuration: blockDuration.value,
      blockEndTime: Date.now() + blockDuration.value * 1000,
    })
  );
};

let newPassword = ref("");
function generateRandomPassword(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  newPassword.value = password;
}

watch(() => phoneNumber.value, validationPhoneNumber);
watch(() => phoneNumberTelegram.value, validationPhoneNumber);

function validationPhoneNumberData() {
  phoneNumberData.value = phoneNumberData.value.replace(/[^0-9]/g, "");
  if (!phoneNumberData.value.startsWith("+7")) {
    phoneNumberData.value =
      "+7" + phoneNumberData.value.replace(/^(\+?7|8)?/, "");
  }

  if (phoneNumberData.value.length > 12) {
    phoneNumberData.value = phoneNumberData.value.slice(0, 12);
  }
}

function validationPhoneNumber() {
  phoneNumber.value = phoneNumber.value.replace(/[^0-9]/g, "");
  phoneNumberTelegram.value = phoneNumberTelegram.value.replace(/[^0-9]/g, "");
  if (!phoneNumber.value.startsWith("+7")) {
    phoneNumber.value = "+7" + phoneNumber.value.replace(/^(\+?7|8)?/, "");
  }

  if (phoneNumber.value.length > 12) {
    phoneNumber.value = phoneNumber.value.slice(0, 12);
  }

  if (!phoneNumberTelegram.value.startsWith("+7")) {
    phoneNumberTelegram.value =
      "+7" + phoneNumberTelegram.value.replace(/^(\+?7|8)?/, "");
  }

  if (phoneNumberTelegram.value.length > 12) {
    phoneNumberTelegram.value = phoneNumberTelegram.value.slice(0, 12);
  }
}

watch(() => phoneNumberData.value, validationPhoneNumberData);

let showPassword = ref(false);
let confirmationCode = ref("");

async function isValidateConfirmationCode() {
  if (confirmationCode.value.length === 5) {
    if (confirmationCode.value === originallyConfirmationCode.value) {
      isLoading.value = true;
      generateRandomPassword(6);
      let response = await storeClients.resetPassword(
        phoneNumberData.value,
        newPassword.value
      );
      if (response.success) {
        isShowSecondConfirmationModal.value = false;
        isShowThirdConfirmationModal.value = true;
      } else {
        toast.error(
          "Произошла ошибка при сбросе пароля. Напишите в поддержку Darom.pro!"
        );
      }
      isLoading.value = false;
    } else {
      toast.error("Вы ввели неправильный код, попробуйте ещё раз!");
    }
  }
}

const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${padWithZero(minutes)}:${padWithZero(seconds)}`;
};

const padWithZero = (num: number): string => {
  return num < 10 ? `0${num}` : num.toString();
};

const formattedBlockDuration = computed(() =>
  formatDuration(blockDuration.value)
);

useSeoMeta({
  title: "Личный кабинет",
  ogTitle: "DAROM.PRO — Личный кабинет",
  description:
    "Получите доступ к заказу из любых интернет-магазинов и свой личный кабинет клиента!",
  ogDescription:
    "Получите доступ к заказу из любых интернет-магазинов и свой личный кабинет клиента!",
});

let isShowTelegramMethod = ref(false);
let isDisabledButtonInsertCode = ref(false);

let selectedTypeOfAuth = ref("telegram");

const isSelectedTypeOfAuthTG = computed(() => {
  return selectedTypeOfAuth.value === "telegram" ? true : false;
});

function checkPhoneNumberValidating() {
  if (phoneNumberTelegram.value.length <= 11) {
    return false;
  }

  if (phoneNumberTelegram.value.length > 12) {
    return false;
  }

  if (!phoneNumberTelegram.value.startsWith("+7")) {
    return false;
  }

  if (phoneNumberTelegram.value.trim() === "") {
    return false;
  }

  return true;
}

function checkPhoneNumberValidatingConfirm() {
  if (phoneNumberData.value.length <= 11) {
    return false;
  }

  if (phoneNumberData.value.length > 12) {
    return false;
  }

  if (!phoneNumberData.value.startsWith("+7")) {
    return false;
  }

  if (phoneNumberData.value.trim() === "") {
    return false;
  }

  return true;
}

const isDisabledAuth = computed(() => {
  if (selectedTypeOfAuth.value && checkPhoneNumberValidating()) {
    return true;
  } else {
    return false;
  }
});

const isDisabledConfirm = computed(() => {
  if (checkPhoneNumberValidatingConfirm()) {
    return true;
  } else {
    return false;
  }
});

function showNotification() {
  toast.warning("В данный момент вход через смс недоступен!");
}

async function openTelegramBot() {
  isLoading.value = true;
  let client = await storeClients.getClientPhone(phoneNumberTelegram.value);
  isLoading.value = false;
  if (client) {
    isShowTelegramMethod.value = false;
    isAuthInsertCode.value = true;
    isDisabledButtonInsertCode.value = true;
    const phoneNumber = phoneNumberTelegram.value.slice(2);

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const url = `https://t.me/darom_pro_bot?start=${phoneNumber}`;

    if (isAndroid) {
      window.open(url, "_blank");
    } else if (isIOS) {
      window.open(url, "_top");
    } else {
      window.open(url, "_blank");
    }
  } else {
    toast.error("Вы не зарегистрированы! Сначала пройдите регистрацию");
  }
}

let isAuthNonComplete = false;
let isAuthInsertCode = ref(false);
let isAuthWithPassword = ref(false);
const intervalId = ref(null);

async function waitingForAuth() {
  isLoading.value = true;
  let client = await storeClients.getAuthClient(
    phoneNumberTelegram.value,
    code.value
  );

  if (client && client.attempts === 0) {
    await storeClients.updateAttemptsTelegramAuth(client.id);
    await signInTelegram();
  } else {
    toast.error("Такой код не найден или Вы используете его второй раз!");
  }
  client = {};
  isLoading.value = false;
}
</script>

<template>
  <Head>
    <Meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
  </Head>
  <div
    v-if="!isLoading"
    class="h-screen flex items-center justify-center max-sm:block"
  >
    <div
      class="max-[360px]:flex py-5 hidden px-10 top-3 left-16 flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UButton
        @click="router.push('/')"
        icon="material-symbols-light:home-app-logo"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >На главную
      </UButton>

      <UButton
        @click="signInNoRegistration()"
        icon="material-symbols:arrow-back"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >Назад
      </UButton>
    </div>
    <div
      :class="{
        'py-20 max-sm:py-20 max-[360px]:py-0': isAuthWithPassword,
        'py-60 max-sm:py-60 max-[360px]:py-40': !isAuthWithPassword,
      }"
      class="px-10 h-full max-sm:py-32 max-sm:px-1 shadow-2xl max-sm:shadow-none bg-opacity-50 max-w-[430px] max-sm:max-w-[2000px]"
    >
      <div class="">
        <div class="flex items-center justify-center">
          <h1
            class="text-center text-secondary-color text-6xl max-sm:text-5xl font-bold"
          >
            DAROM.PRO
          </h1>
        </div>
      </div>

      <div class="flex items-center justify-center flex-col gap-3 mt-10">
        <UButton
          @click="router.push('/auth/client/login?stay=true&index=true')"
          icon="material-symbols:person-book"
          class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
          type="submit"
        >
          Войти
        </UButton>
        <h1 class="text-base">ИЛИ</h1>
        <UButton
          @click="router.push('/auth/register?index=true')"
          icon="material-symbols:app-registration"
          class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
          >Зарегистрироваться
        </UButton>
      </div>
    </div>

    <div
      class="absolute max-[360px]:hidden top-3 left-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UButton
        @click="router.push('/')"
        icon="material-symbols-light:home-app-logo"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >На главную
      </UButton>
    </div>

    <div
      class="absolute w-[235px] max-[360px]:hidden top-3 right-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UButton
        @click="signInNoRegistration()"
        icon="material-symbols:arrow-back"
        class="w-[235px] max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >Назад
      </UButton>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
