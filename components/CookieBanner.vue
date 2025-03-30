<script setup lang="ts">
import Cookies from "js-cookie";
import { ref, onMounted } from "vue";

const accepted = ref(false);

onMounted(() => {
  accepted.value = Cookies.get("cookiesAccepted") === "true";
});

const acceptCookies = () => {
  Cookies.set("cookiesAccepted", "true", { expires: 365, path: "/" });
  accepted.value = true;
};
</script>

<template>
  <div
    v-if="!accepted"
    class="fixed flex items-center justify-between mx-auto w-full max-sm:bottom-16 max-sm:rounded-t-lg bottom-4 bg-gray-800 text-white p-4 rounded-e-lg shadow-lg max-w-[900px] max-lg:flex-col max-lg:gap-5 font-bold"
  >
    <span class="text-sm">
      Для улучшения работы сайта и его взаимодействия с пользователями мы
      используем файлы cookie. Продолжая работу с сайтом, Вы разрешаете
      использование cookie-файлов.
    </span>
    <button
      @click="acceptCookies"
      class="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm"
    >
      Принять
    </button>
  </div>
</template>
