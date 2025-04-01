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

  if (
    clients.value.some(
      (client: Client) => client.phoneNumber === phoneNumberData.value.trim()
    )
  ) {
    errorTextValidation.value = "Вы уже зарегистрированы!";
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
  } as Client);

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

let clients = ref([] as any);
let isIndex = ref(false);
const settings = ref<Array<any>>([]);
const storeUsers = useUsersStore();
onMounted(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  clients.value = await storeClients.getClients();
  settings.value = await storeUsers.getSettings();
  isLoading.value = false;

  if (route.query.index) {
    isIndex.value = true;
  }

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
  confirmationCode.value = confirmationCode.value.trim();
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
  title: "Регистрация клиента",
  ogTitle: "Регистрация клиента",
  description:
    "Получите доступ к заказу из любых интернет-магазинов и свой личный кабинет клиента!",
  ogDescription:
    "Получите доступ к заказу из любых интернет-магазинов и свой личный кабинет клиента!",
});

let isShowTelegramMethod = ref(false);
let isShowRegistrationSMS = ref(false);

async function signInNoRegistration() {
  message.value = "";
  isLoading.value = true;
  message.value = await storeClients.signIn("+70000000001", "001001", false);
  isLoading.value = false;
}

const config = useRuntimeConfig();
const linkToDB = config.public.supabaseUrl as string;
</script>

<template>
  <div
    v-if="!isLoading"
    class="h-screen max-sm:h-full flex items-center justify-center max-sm:block"
  >
    <div
      class="max-[380px]:flex py-5 hidden px-10 top-3 left-16 flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UButton
        @click="router.push('/')"
        icon="material-symbols-light:home-app-logo"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >На главную
      </UButton>

      <UButton
        v-if="!isIndex"
        @click="router.push('/auth/client/login?stay=true')"
        icon="material-symbols:person-book"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >Войти в личный кабинет
      </UButton>
      <UButton
        v-if="isIndex"
        @click="router.push('/auth/client')"
        icon="material-symbols:arrow-back"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >Назад
      </UButton>
    </div>
    <div
      :class="{
        'py-20 max-sm:py-20 max-[380px]:py-0': isShowRegistrationSMS,
        'py-60 max-sm:py-60 max-[380px]:py-40': !isShowRegistrationSMS,
      }"
      class="px-10 relative h-screen max-sm:h-full max-sm:px-1 shadow-2xl max-sm:shadow-none bg-opacity-50"
    >
      <div>
        <div class="flex items-center justify-center">
          <h1
            v-if="settings[0]"
            class="text-center text-secondary-color text-6xl max-sm:text-5xl font-bold"
          >
            {{ settings[0].title }}
          </h1>
        </div>
        <h2
          class="mt-5 text-center text-2xl max-sm:text-xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Регистрация клиента
        </h2>
      </div>

      <div class="space-y-3 mt-10">
        <div class="flex items-center justify-center mt-3">
          <UButton
            @click="
              (isShowTelegramMethod = !isShowTelegramMethod),
                (isShowRegistrationSMS = false)
            "
            icon="ic:baseline-telegram"
            class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
            >Зарегистрироваться через телеграм
          </UButton>
        </div>
        <div class="flex items-center justify-center">
          <UButton
            @click="isShowRegistrationSMS = !isShowRegistrationSMS"
            type="submit"
            icon="ic:baseline-wechat"
            class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
            >Зарегистрироваться по СМС
          </UButton>
        </div>
      </div>

      <div class="mt-5 max-sm:px-3" v-if="isShowRegistrationSMS">
        <form class="space-y-7" @submit.prevent="register">
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
                  :href="`${linkToDB}/storage/v1/object/public/files/docx/policy_info_tb.pdf`"
                  target="_blank"
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
                  :href="`${linkToDB}/storage/v1/object/public/files/docx/policy_conf_tb.pdf`"
                  target="_blank"
                  >Политики конфиденциальности</a
                ></label
              >
            </div>
          </div>
          <div v-if="errorTextValidation !== ''">
            <h1 class="text-red-700 text-center my-1">
              {{ errorTextValidation }}
            </h1>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-center">
              <UButton
                type="submit"
                class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
                :disabled="isButtonDisabled || isBlocked"
                >Зарегистрироваться
              </UButton>
            </div>
          </div>
        </form>
      </div>
    </div>

    <UModal
      :ui="{
        container: 'flex items-center justify-center text-center',
      }"
      v-model="isShowTelegramMethod"
      prevent-close
    >
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold flex items-center gap-2 leading-6 text-gray-900 dark:text-white"
            >
              Регистрация <Icon name="ic:baseline-telegram" size="24" />
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isShowTelegramMethod = false"
            />
          </div>
        </template>

        <div class="px-10 max-sm:px-0 text-center">
          Для регистрации через Telegram перейдите в наш официальный
          <a
            class="font-semibold text-secondary-color underline"
            href="https://t.me/punkt1off_bot?start=register"
            target="_blank"
            >Телеграм-бот</a
          >
          (@punkt1off_bot)
        </div>
        <h1 class="my-3 text-sm italic text-center">
          Если у вас нет телеграма или нужно зарегистрировать другой номер
          телефона, нажмите
          <span
            @click="
              (isShowTelegramMethod = false), (isShowRegistrationSMS = true)
            "
            class="font-semibold text-secondary-color underline cursor-pointer"
          >
            здесь</span
          >
        </h1>
      </UCard>
    </UModal>

    <UModal
      :ui="{
        container: 'flex items-center justify-center text-center',
      }"
      v-model="isShowConfirmationModal"
      prevent-close
    >
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold flex items-center gap-2 leading-6 text-gray-900 dark:text-white"
            >
              Подтверждение <Icon name="ic:baseline-wechat" size="24" />
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isShowConfirmationModal = false"
            />
          </div>
        </template>

        <div class="flex items-center justify-center">
          <div class="rounded-2xl space-y-5">
            <div class="space-y-5">
              <p class="text-center">
                Введите код в текстовое поле снизу,
                <br class="max-[335px]:hidden" />
                который придёт на Ваш номер телефона.
              </p>
              <div class="flex justify-center">
                <UInput
                  type="text"
                  @blur="isValidateConfirmationCode"
                  v-model="confirmationCode"
                />
              </div>
              <div class="flex items-center justify-center gap-3">
                <UIMainButton
                  :disabled="isButtonDisabled || isBlocked"
                  @click="register"
                  >Отправить код ещё раз</UIMainButton
                >
                <UIMainButton @click="isValidateConfirmationCode"
                  >Проверить код</UIMainButton
                >
              </div>
              <div class="flex items-center justify-center gap-3">
                {{ formattedBlockDuration }}
              </div>
              <h1 class="text-center italic text-base">
                Если код не пришёл, то отправьте ещё раз!
              </h1>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>

    <div
      class="absolute max-[380px]:hidden top-3 left-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UButton
        @click="router.push('/')"
        icon="material-symbols-light:home-app-logo"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >На главную
      </UButton>
    </div>

    <div
      class="absolute max-[380px]:hidden top-3 right-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UButton
        v-if="!isIndex"
        @click="router.push('/auth/client/login?stay=true')"
        icon="material-symbols:person-book"
        class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
        >Войти в личный кабинет
      </UButton>
      <UButton
        v-if="isIndex"
        @click="router.push('/auth/client')"
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
