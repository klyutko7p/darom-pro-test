<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const router = useRouter();

const username = ref("");
const password = ref("");
const message = ref("");

let isLoading = ref(false);

async function signIn() {
  isLoading.value = true;
  message.value = await storeUsers.signIn(username.value, password.value);
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  isLoading.value = false;

  if (token && user.value.role === "ADMIN") {
    router.push("/admin/main");
  } else if (token && user.value.role === "USER") {
    router.push("/user/main");
  }
});
let showPassword = ref(false)
</script>

<template>
  <Head>
    <Title>Авторизация</Title>
  </Head>
  <div v-if="!isLoading" class="h-screen flex items-center justify-center max-sm:block">
    <div
      class="px-10 py-40 h-full max-sm:px-1 shadow-2xl border-2 border-[#f0f0f0] bg-opacity-50"
    >
      <div class="">
        <div class="flex items-center justify-center">
          <h1 class="text-center text-secondary-color text-6xl max-sm:text-5xl font-bold">DAROM.PRO</h1>
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
            <label for="username" class="block text-sm font-medium leading-6 text-gray-900"
              >Имя пользователя</label
            >
            <div class="mt-2">
              <input
                v-model="username"
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                placeholder="Введите имя пользователя"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
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
          <div v-if="message !== ''">
            <h1 class="text-red-700">{{ message }}</h1>
          </div>
          <div class="flex items-center justify-center">
            <UIMainButton class="w-full">Войти</UIMainButton>
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
    <div
      class="absolute top-3 right-2 flex flex-col text-center text-secondary-color font-bold gap-3"
    >
      <UIMainButton
        class="bg-secondary-color px-5 py-3 max-sm:w-full text-white"
        @click="router.push('/auth/client/login')"
        >Вход клиента</UIMainButton
      >
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
