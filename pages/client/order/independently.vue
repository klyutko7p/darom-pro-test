<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;
});

definePageMeta({
  layout: "client",
});
</script>

<template>
  <Head>
    <Title>Оформить заказ самостоятельно</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-10">
        <h1
          class="font-bold text-4xl max-md:text-3xl max-sm:text-2xl max-md:text-center mb-3"
        >
          Инструкция для оформления заказа
        </h1>
        <ul class="list-decimal max-md:px-3">
          <li class="mb-3 text-xl max-md:text-lg max-sm:text-base">
            При заказе выберите для доставки наш адрес: <br />
            <span class="italic font-bold"
              >Ростовская обл, Матвеево-Курганский р-н, с. Ряженое, ул. Ленина 6</span
            >
          </li>
          <li class="mb-3 text-xl max-md:text-lg max-sm:text-base">
            Когда заказ готов к выдаче, прикрепите скриншот Штрих кода из приложения в
            <UIMainButton @click="router.push('/client/delivery')" class="my-2"
              >Доставить мой заказ</UIMainButton
            >
          </li>
          <li class="mb-3 text-xl max-md:text-lg max-sm:text-base">
            Информация о статусе заказа в
            <UIMainButton @click="router.push('/client/my-orders')" class="my-2"
              >Мои заказы</UIMainButton
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
