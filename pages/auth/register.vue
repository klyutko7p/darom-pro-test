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
const refValue = route.query.hash ? (route.query.hash as string) : "";
const queryValue = route.query.q ? (route.query.q as string) : "";
const phoneNumberValue = route.query.phone
  ? storeClients.decryptPhoneNumber(route.query.phone as string)
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

let isPersonalDataProcessingPolicyAgreed = ref(false);
let isPrivacyPolicyAgreed = ref(false);

async function confirmationRegistration() {
  isLoading.value = true;
  let statusRegistration = await storeClients.register({
    id: 0,
    phoneNumber: phoneNumberData.value,
    password: password.value,
    fio: fio.value,
    role: "CLIENT",
    created_at: new Date(),
    isPersonalDataProcessingPolicyAgreed:
      isPersonalDataProcessingPolicyAgreed.value,
    isPrivacyPolicyAgreed: isPrivacyPolicyAgreed.value,
  });

  if (statusRegistration) {
    await storeClients.signIn(phoneNumberData.value, password.value, false);
  }

  if (storeClients.compareReferralLinkNumber(queryValue, refValue)) {
    await storeClients.createReferralClient(
      phoneNumberData.value,
      phoneNumberValue
    );
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
    const { blockDuration: savedBlockDuration, blockEndTime } =
      JSON.parse(blockState);
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
  phoneNumberData.value = phoneNumberData.value.replace(/[^0-9]/g, "");
  if (!phoneNumberData.value.startsWith("+7")) {
    phoneNumberData.value =
      "+7" + phoneNumberData.value.replace(/^(\+?7|8)?/, "");
  }

  if (phoneNumberData.value.length > 12) {
    phoneNumberData.value = phoneNumberData.value.slice(0, 12);
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

const formattedBlockDuration = computed(() =>
  formatDuration(blockDuration.value)
);

useSeoMeta({
  title: "DAROM.PRO — Регистрация клиента",
  ogTitle: "DAROM.PRO — Регистрация клиента",
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
      class="px-10 relative h-full py-20 max-sm:py-20 max-sm:px-1 shadow-2xl border-2 border-[#f0f0f0] bg-opacity-50"
    >
      <div
        class="absolute top-4 right-4 text-center text-secondary-color font-bold mt-5"
      >
        <NuxtLink to="/auth/client/login">Войти в личный кабинет</NuxtLink>
      </div>
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
          Регистрация клиента
        </h2>
      </div>

      <div class="mt-5 max-sm:px-3">
        <form class="space-y-10" @submit.prevent="register">
          <div>
            <label
              for="phone"
              class="block text-sm font-medium leading-6 text-gray-900"
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
                >Придумайте пароль</label
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
          <div>
            <div class="flex items-center justify-between">
              <label
                for="repeat-password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Повторите пароль</label
              >
            </div>
            <div class="mt-2">
              <UInput
                v-model="repeatPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="******"
              />
            </div>
          </div>
          <div class="max-w-[350px] max-sm:w-full max-sm:max-w-none space-y-3">
            <div class="flex items-start gap-3 p-2">
              <div>
                <input
                  class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                  type="checkbox"
                  required
                  v-model="isPersonalDataProcessingPolicyAgreed"
                />
              </div>
              <label class="italic text-sm"
                >Подтверждаю, что я ознакомлен и согласен с условиями
                <a
                  class="text-secondary-color font-semibold duration-200 cursor-pointer hover:opacity-50"
                  href="https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/files/docx/policy_info_dp.pdf"
                  >Политики обработки персональных данных</a
                ></label
              >
            </div>

            <div class="flex items-start gap-3 p-2">
              <div>
                <input
                  class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                  type="checkbox"
                  required
                  v-model="isPrivacyPolicyAgreed"
                />
              </div>
              <label class="italic text-sm"
                >Подтверждаю, что я ознакомлен и согласен с условиями
                <a
                  class="text-secondary-color font-semibold duration-200 cursor-pointer hover:opacity-50"
                  href="https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/files/docx/policy_conf_dp.pdf"
                  >Политики конфиденциальности</a
                ></label
              >
            </div>
          </div>
          <div v-if="message !== ''">
            <h1 class="text-red-700">{{ message }}</h1>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-center">
              <UIMainButton
                class="w-full max-sm:max-w-[400px]"
                :disabled="isButtonDisabled || isBlocked"
                >Зарегистрироваться</UIMainButton
              >
            </div>
            <h1 class="text-center font-bold text-red-500">
              {{ errorTextValidation }}
            </h1>
          </div>
        </form>
      </div>
    </div>

    <UINewModalEdit
      v-if="isShowConfirmationModal"
      @close-modal="isShowConfirmationModal = !isShowConfirmationModal"
    >
      <template v-slot:icon-header> </template>
      <template v-slot:header>Подтверждение</template>
      <template v-slot:body>
        <div class="flex items-center justify-center pt-5">
          <div class="rounded-2xl space-y-5">
            <div class="space-y-5">
              <p class="text-center">
                Введите код в текстовое поле снизу, который придёт на Ваш номер
                телефона.
              </p>
              <div class="flex justify-center">
                <UInput
                  type="text"
                  @input="isValidateConfirmationCode"
                  v-model="confirmationCode"
                />
              </div>
              <div class="flex justify-center flex-col items-center gap-3">
                <UIMainButton
                  :disabled="isButtonDisabled || isBlocked"
                  @click="register"
                  >Отправить код ещё раз</UIMainButton
                >
                {{ formattedBlockDuration }}
              </div>
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
