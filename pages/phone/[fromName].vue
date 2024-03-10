<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storePhoneNumbers = usePhoneNumbersStore();
const router = useRouter();
const route = useRoute();
const fromName = route.params.fromName;

let isLoading = ref(false);

let user = ref({} as User);
let row = ref({} as IPhoneNumber);

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  await storePhoneNumbers.getPhoneNumbers();
  row.value = await storePhoneNumbers.getPhoneNumberByFromName(fromName);
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Адрес клиента</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10" v-if="!isLoading">
          <div
            class="flex items-center justify-center flex-col gap-3"
            v-if="row"
          >
            <h1 class="font-medium text-2xl">Телефон: {{ row.number }}</h1>
            <h1 class="font-medium text-2xl">Адрес: {{ row.address }}</h1>
          </div>
          <div v-else>
            <h1 class="text-4xl text-center mb-3">😞</h1>
            <h1 class="text-3xl text-center">Извините, адрес не был найден!</h1>
          </div>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-10" v-if="!isLoading">
          <div
            class="flex items-center justify-center flex-col gap-3"
            v-if="row"
          >
            <h1 class="font-medium text-2xl">Телефон: {{ row.number }}</h1>
            <h1 class="font-medium text-2xl">Адрес: {{ row.address }}</h1>
          </div>
          <div v-else>
            <h1 class="text-4xl text-center mb-3">😞</h1>
            <h1 class="text-3xl text-center">Извините, адрес не был найден!</h1>
          </div>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
