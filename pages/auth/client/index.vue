<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();

let isLoading = ref(false);

let user = ref({} as User);
const token = Cookies.get("token");

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;

  // if (token && user.value.role === "ADMIN") {
  //   router.push("/admin/main");
  // } else if (token && user.value.role === "USER") {
  //   router.push("/user/main");
  // } else if (token && user.value.role === "CLIENT") {
  //   router.push("/client/main");
  // }
});

definePageMeta({
  layout: "client-auth",
});

function signOut() {
  storeClients.signOut();
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
      class="px-10 py-60 max-sm:py-60 max-[360px]:py-40 h-full max-sm:px-1 shadow-2xl max-sm:shadow-none bg-opacity-50 max-w-[430px] max-sm:max-w-[2000px]"
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
          Вход и Регистрация
        </h2>
      </div>

      <div class="flex items-center justify-center flex-col gap-3 mt-10">
        <UButton
          @click="router.push('/auth/client/login-2?stay=true&index=true')"
          icon="material-symbols:person-book"
          class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
          type="submit"
        >
          Войти
        </UButton>
        <h1 class="text-base">ИЛИ</h1>
        <UButton
          @click="router.push('/auth/register-2?index=true')"
          icon="material-symbols:app-registration"
          class="w-full max-sm:max-w-[400px] flex items-center justify-center uppercase font-bold rounded-xl duration-200"
          >Зарегистрироваться
        </UButton>
      </div>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
