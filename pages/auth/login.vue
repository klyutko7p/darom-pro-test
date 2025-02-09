<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const router = useRouter();

const username = ref("");
const password = ref("");
const message = ref("");

let isLoading = ref(false);
let isForeignDevice = ref(false);

async function signIn() {
  isLoading.value = true;
  message.value = await storeUsers.signIn(
    username.value.trim(),
    password.value.trim(),
    isForeignDevice.value
  );
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  isLoading.value = false;

  if (token && user.value.role === "ADMIN") {
    router.push("/admin/main");
  } else if (token && user.value.role === "USER") {
    router.push("/user/main");
  }
});
let showPassword = ref(false);
</script>

<template>
  <Head>
    <Title>Авторизация</Title>
    <meta name="robots" content="none, noarchive" />
  </Head>
  <div
    v-if="!isLoading"
    class="h-screen flex items-center justify-center max-sm:block"
  >
    <div
      class="px-10 py-40 h-full max-sm:px-1 shadow-2xl border-2 border-[#f0f0f0] bg-opacity-50"
    >
      <div class="">
        <div class="flex items-center justify-center">
          <h1
            class="text-center text-secondary-color text-6xl max-sm:text-5xl font-bold"
          >
            ТЕСТ
          </h1>
        </div>
        <h2
          class="mt-5 text-center text-2xl max-sm:text-xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Авторизация сотрудника
        </h2>
      </div>

      <div class="mt-10 max-sm:px-3">
        <form class="space-y-10" @submit.prevent="signIn">
          <div>
            <label
              for="username"
              class="block text-sm font-medium leading-6 text-gray-900"
              >Имя пользователя</label
            >
            <div class="mt-2">
              <UInput
                v-model="username"
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                placeholder="Введите имя пользователя"
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
            <h1 class="text-red-700">{{ message }}</h1>
          </div>
          <div class="flex items-center justify-center">
            <UIMainButton class="w-full max-sm:max-w-[400px]"
              >Войти</UIMainButton
            >
          </div>
        </form>
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
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
