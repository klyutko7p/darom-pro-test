<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const storeClients = useClientsStore();
const router = useRouter();

const toast = useToast();
const phoneNumber = ref("+7");
const password = ref("");
const message = ref("");

let isLoading = ref(false);
let isForeignDevice = ref(false);

async function signIn() {
  isLoading.value = true;
  message.value = await storeClients.signIn(
    phoneNumber.value.trim(),
    password.value.trim(),
    isForeignDevice.value
  );
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");

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
});

function generateRandomFiveDigitNumber(): string {
  const min = 10000;
  const max = 99999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
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
  if (!phoneNumber.value.startsWith("+7")) {
    phoneNumber.value = "+7" + phoneNumber.value.replace(/^(\+?7|8)?/, "");
  }

  if (phoneNumber.value.length > 12) {
    phoneNumber.value = phoneNumber.value.slice(0, 12);
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
  title: "DAROM.PRO — Авторизация клиента",
  ogTitle: "DAROM.PRO — Авторизация клиента",
  description:
    "Получите доступ к заказу из любых интернет-магазинов и свой личный кабинет клиента!",
  ogDescription:
    "Получите доступ к заказу из любых интернет-магазинов и свой личный кабинет клиента!",
});
</script>

<template>
  <div
    v-if="!isLoading"
    class="h-screen flex items-center justify-center max-sm:block"
  >
    <div
      class="px-10 py-20 h-full max-sm:py-32 max-sm:px-1 shadow-2xl border-2 border-[#f0f0f0] bg-opacity-50 max-w-[430px] max-sm:max-w-[2000px]"
    >
      <div class="">
        <div class="flex items-center justify-center">
          <h1
            class="text-center text-secondary-color text-6xl max-sm:text-5xl font-bold"
          >
            DAROM.PRO
          </h1>
        </div>
        <h2
          class="mt-5 text-center text-2xl max-sm:text-xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Авторизация клиента
        </h2>
      </div>

      <div class="mt-10 max-sm:px-3">
        <form class="space-y-6" @submit.prevent="signIn">
          <div>
            <label
              for="phone"
              class="block text-sm font-medium leading-6 text-gray-900"
              >Телефон (формат +7XXXXXXXXXX)</label
            >
            <div class="mt-2">
              <input
                v-model="phoneNumber"
                id="phone"
                name="phone"
                type="text"
                autocomplete="phone"
                required
                placeholder="+7XXXXXXXXXX"
                @input="validationPhoneNumber"
                class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Пароль</label
              >
            </div>
            <div class="mt-2 relative">
              <UInput
                v-model="password"
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="******"
              />
              <Icon
                @click="showPassword = !showPassword"
                name="ic:round-remove-red-eye"
                class="cursor-pointer hover:text-secondary-color duration-100 absolute top-2 right-2"
                size="20"
              />
            </div>
          </div>
          <h1 class="text-sm text-center italic font-bold text-secondary-color">
            Если не можете вспомнить пароль, <br />
            нажмите
            <span
              class="underline cursor-pointer"
              @click="isShowFirstConfirmationModal = true"
              >здесь</span
            >
          </h1>
          <div class="flex items-center gap-3 p-3">
            <div>
              <input
                class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                v-model="isForeignDevice"
                id="isForeignDevice"
                name="isForeignDevice"
                type="checkbox"
              />
            </div>
            <label for="isForeignDevice" class="italic text-sm"
              >Чужое устройство</label
            >
          </div>
          <div v-if="message !== ''">
            <h1 class="text-red-700 text-center">{{ message }}</h1>
          </div>
          <div class="flex items-center justify-center">
            <UIMainButton class="w-full max-sm:max-w-[400px]"
              >Войти</UIMainButton
            >
          </div>
          <div class="text-center underline text-secondary-color font-bold">
            <NuxtLink to="/auth/register">Или зарегистрируйтесь</NuxtLink>
          </div>
        </form>
      </div>
    </div>

    <UINewModalEdit
      v-if="isShowFirstConfirmationModal"
      @close-modal="
        isShowFirstConfirmationModal = !isShowFirstConfirmationModal
      "
    >
      <template v-slot:icon-header> </template>
      <template v-slot:header>Подтверждение</template>
      <template v-slot:body>
        <div class="flex items-center justify-center pt-5">
          <div class="bg-white rounded-2xl">
            <div class="space-y-5">
              <p class="text-center">
                Введите свой телефон в текстовое поле снизу и нажмите кнопку
                "Отправить код".
              </p>
              <div class="flex justify-center mt-5">
                <input
                  @input="validationPhoneNumberData"
                  v-model="phoneNumberData"
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  autocomplete="phoneNumber"
                  required
                  placeholder="+7XXXXXXXXXX"
                  class="relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                />
              </div>
              <div class="flex justify-center items-center gap-3 mt-5">
                <UIMainButton @click="validatePhone"
                  >Отправить код</UIMainButton
                >
              </div>
            </div>
          </div>
        </div>
      </template>
    </UINewModalEdit>

    <UINewModalEdit
      v-if="isShowSecondConfirmationModal"
      @close-modal="
        isShowSecondConfirmationModal = !isShowSecondConfirmationModal
      "
    >
      <template v-slot:icon-header> </template>
      <template v-slot:header>Подтверждение</template>
      <template v-slot:body>
        <div class="flex items-center justify-center pt-5">
          <div class="bg-white rounded-2xl">
            <div class="space-y-5">
              <p class="text-left">
                Введите код в текстовое поле снизу, который придёт на Ваш номер
                телефона.
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
                <UIMainButton
                  :disabled="isButtonDisabled || isBlocked"
                  @click="validatePhone"
                  >Отправить код ещё раз</UIMainButton
                >
                {{ formattedBlockDuration }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </UINewModalEdit>

    <UINewModalEdit
      v-if="isShowThirdConfirmationModal"
      @close-modal="
        isShowThirdConfirmationModal = !isShowThirdConfirmationModal
      "
    >
      <template v-slot:icon-header> </template>
      <template v-slot:header>Статус пароля</template>
      <template v-slot:body>
        <div class="flex items-center justify-center pt-5">
          <div class="bg-white rounded-2xl max-w-[550px]">
            <div class="space-y-5 text-left">
              <p class="mb-5 space-y-3">
                Ваш пароль успешно был сброшен. <br />
                Ваш пароль теперь:
                <span class="font-bold"> {{ newPassword }} </span>
              </p>
              <p class="text-left">
                Обязательно запомните этот пароль и никому его не сообщайте!
                После авторизации Вы можете его сменить.
              </p>
            </div>
          </div>
        </div>
      </template>
    </UINewModalEdit>

    <div
      class="absolute top-3 left-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UIMainButton
        class="bg-secondary-color px-5 py-3 max-sm:w-full text-white"
        @click="router.push('/')"
        >На главную</UIMainButton
      >
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
