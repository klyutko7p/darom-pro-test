<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const phoneNumberData = ref("+7");
const fio = ref("");
const password = ref("");
const repeatPassword = ref("");
const message = ref("");
const refValue = route.query.ref ? route.query.ref : "";
const queryValue = route.query.q ? route.query.q : "";
const phoneNumberValue = route.query.phone
  ? storeClients.decryptPhoneNumber(route.query.phone)
  : "";

function generateRandomFiveDigitNumber(): string {
  const min = 10000;
  const max = 99999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

let isLoading = ref(false);

let errorTextValidation = ref("");
let originallyConfirmationCode = ref("");
let isShowConfirmationModal = ref(false);

const isButtonDisabled = ref(false);
const attempts = ref(0);
const isBlocked = ref(false);
const blockDuration = ref(0);
let blockInterval: NodeJS.Timeout | null = null;

async function register() {
  if (phoneNumberData.value.length < 11) {
    errorTextValidation.value = "Неправильный ввод номера телефона";
    return;
  }

  if (phoneNumberData.value.length > 12) {
    errorTextValidation.value = "Неправильный ввод номера телефона";
    return;
  }

  if (!phoneNumberData.value.startsWith("+7")) {
    errorTextValidation.value = 'Номер телефона должен начинаться с "+7"';
    return;
  }

  if (phoneNumberData.value.trim() === "") {
    errorTextValidation.value = "Пожалуйста, введите свой номер телефона";
    return;
  }

  if (password.value.trim() === "") {
    errorTextValidation.value = "Пожалуйста, введите пароль";
    return;
  }

  if (password.value.trim().length < 6) {
    errorTextValidation.value = "Пароль должен состоять хотя бы из 6 знаков!";
    return;
  }

  if (repeatPassword.value?.trim() === "") {
    errorTextValidation.value = "Пожалуйста, повторите пароль";
    return;
  }

  if (password.value !== repeatPassword.value) {
    errorTextValidation.value = "Пароль и повтор пароля не совпадают";
    return;
  }

  errorTextValidation.value = "";

  if (isBlocked.value) return;

  if (attempts.value >= 2) {
    blockForFifteenMinutes();
    toast.error(
      "Вам на 15 минут заблокирован доступ к регистрации. Попробуйте зарегистрироваться в следующий раз!"
    );
  } else {
    isLoading.value = true;
    originallyConfirmationCode.value = generateRandomFiveDigitNumber();
    disableButtonForOneMinute();
    isShowConfirmationModal.value = true;
    await storeClients.sendMessage(
      phoneNumberData.value,
      originallyConfirmationCode.value
    );
    attempts.value++;
  }

  isLoading.value = false;
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
      localStorage.removeItem("blockState");
    }
  }, 1000);
};

async function confirmationRegistration() {
  isLoading.value = true;
  await storeClients.register({
    id: 0,
    phoneNumber: phoneNumberData.value,
    password: password.value,
    fio: fio.value,
    role: "CLIENT",
    created_at: new Date(),
  });

  if (storeClients.compareReferralLinkNumber(queryValue, refValue)) {
    await storeClients.createReferralClient(phoneNumberData.value, phoneNumberValue);
  }
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");

const saveBlockState = () => {
  localStorage.setItem(
    "blockState",
    JSON.stringify({
      blockDuration: blockDuration.value,
      blockEndTime: Date.now() + blockDuration.value * 1000,
    })
  );
};

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;

  if (token && user.value.role === "ADMIN") {
    router.push("/admin/main");
  } else if (token && user.value.role === "USER") {
    router.push("/user/main");
  } else if (token && user.value.role === "CLIENT") {
    router.push("/client/main");
  }

  const blockState = localStorage.getItem("blockState");
  if (blockState) {
    const { blockDuration: savedBlockDuration, blockEndTime } = JSON.parse(blockState);
    const remainingTime = Math.ceil((blockEndTime - Date.now()) / 1000);
    if (remainingTime > 0) {
      blockDuration.value = remainingTime;
      isBlocked.value = true;
      blockInterval = setInterval(() => {
        blockDuration.value--;
        if (blockDuration.value <= 0) {
          clearInterval(blockInterval!);
          isBlocked.value = false;
          attempts.value = 0;
          localStorage.removeItem("blockState");
        }
      }, 1000);
    }
  }
});

watch(() => phoneNumberData.value, validationPhoneNumber);

function validationPhoneNumber() {
  phoneNumberData.value = phoneNumberData.value.replace(/[^0-9+]/g, "");
  if (!phoneNumberData.value.startsWith("+7")) {
    phoneNumberData.value = "+7" + phoneNumberData.value.replace(/^(\+?7|8)?/, "");
  }
}

let showPassword = ref(false);
let confirmationCode = ref("");

async function isValidateConfirmationCode() {
  if (confirmationCode.value.length === 5) {
    if (confirmationCode.value === originallyConfirmationCode.value) {
      isLoading.value = true;
      await confirmationRegistration();
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

const formattedBlockDuration = computed(() => formatDuration(blockDuration.value));
</script>

<template>
  <Head>
    <Title>Регистрация</Title>
  </Head>
  <div v-if="!isLoading" class="h-screen flex items-center justify-center max-sm:block">
    <div
      class="px-10 h-full py-40 max-sm:py-32 max-sm:px-1 shadow-2xl border-2 border-[#f0f0f0] bg-opacity-50"
    >
      <div class="">
        <div class="flex items-center justify-center">
          <h1 class="text-center text-secondary-color text-6xl max-sm:text-5xl font-bold">
            DAROM.PRO
          </h1>
        </div>
        <h2
          class="mt-5 text-center text-2xl max-sm:text-xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Регистрация клиента
        </h2>
      </div>

      <div class="mt-10 max-sm:px-3">
        <form class="space-y-10" @submit.prevent="register">
          <div>
            <label for="phone" class="block text-sm font-medium leading-6 text-gray-900"
              >Телефон (формат +7XXXXXXXXXX)</label
            >
            <div class="mt-2">
              <input
                v-model="phoneNumberData"
                id="phone"
                name="phone"
                type="text"
                autocomplete="phone"
                required
                placeholder="+7XXXXXXXXXX"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                @input="validationPhoneNumber"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Придумайте пароль</label
              >
            </div>
            <div class="mt-2 relative">
              <input
                v-model="password"
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="******"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
              />
              <Icon
                @click="showPassword = !showPassword"
                name="ic:round-remove-red-eye"
                class="cursor-pointer hover:text-secondary-color duration-100 absolute top-2 right-2"
                size="20"
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label
                for="repeat-password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Повторите пароль</label
              >
            </div>
            <div class="mt-2">
              <input
                v-model="repeatPassword"
                id="repeat-password"
                name="repeat-password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="******"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
              />
            </div>
          </div>
          <div v-if="message !== ''">
            <h1 class="text-red-700">{{ message }}</h1>
          </div>
          <div class="flex items-center justify-center">
            <UIMainButton class="w-full" :disabled="isButtonDisabled || isBlocked"
              >Зарегистрироваться</UIMainButton
            >
          </div>
          <h1 class="text-center font-bold text-red-500">{{ errorTextValidation }}</h1>
        </form>
        <div class="text-center underline text-secondary-color font-bold mt-5">
          <NuxtLink to="/auth/client/login">Или войдите</NuxtLink>
        </div>
      </div>
    </div>

    <div
      v-if="isShowConfirmationModal"
      class="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-65 z-[200]"
    >
      <div class="flex items-center justify-center h-screen">
        <div class="bg-white rounded-2xl max-w-[550px]">
          <div class="border-b-2 p-5 flex items-center gap-24 justify-between">
            <p class="font-medium text-2xl">Подтверждение номера телефона</p>
            <Icon
              @click="isShowConfirmationModal = !isShowConfirmationModal"
              class="hover:text-hover-color duration-200 cursor-pointer"
              name="material-symbols:close-rounded"
              size="24"
            />
          </div>
          <div class="px-10 py-5">
            <p class="text-xl text-center">
              Введите код в текстовое поле снизу, который придёт на Ваш номер телефона.
            </p>
            <div class="flex justify-center mt-5">
              <input
                class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                type="text"
                @input="isValidateConfirmationCode"
                v-model="confirmationCode"
              />
            </div>
            <div class="flex justify-center items-center gap-3 mt-5">
              <UIMainButton :disabled="isButtonDisabled || isBlocked" @click="register"
                >Отправить код ещё раз</UIMainButton
              >
              {{ formattedBlockDuration }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="absolute top-3 left-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UIMainButton
        class="bg-secondary-color px-5 py-3 max-sm:w-full text-white"
        @click="router.push('/')"
        >На главную</UIMainButton
      >
    </div>
    <div
      class="absolute top-3 right-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UIMainButton
        class="bg-secondary-color px-5 py-3 max-sm:w-full text-white"
        @click="router.push('/auth/login')"
        >Вход сотрудника</UIMainButton
      >
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
