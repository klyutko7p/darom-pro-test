<script setup lang="ts">
const accepted = ref(false);

onMounted(() => {
  accepted.value = localStorage.getItem("cookiesAccepted") === "true";
});

const acceptCookies = () => {
  localStorage.setItem("cookiesAccepted", "true");
  accepted.value = true;
};
</script>

<template>
  <div
    v-if="!accepted"
    class="fixed flex items-center justify-between mx-auto w-full bottom-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-[900px] max-lg:flex-col max-lg:gap-5 font-bold"
  >
    <span class="text-sm"
      >Для улучшения работы сайта и его взаимодействия с пользователями мы
      используем файлы cookie. Продолжая работу с сайтом, Вы разрешаете
      использование cookie-файлов.</span
    >
    <button
      @click="acceptCookies"
      class="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm"
    >
      Принять
    </button>
  </div>
</template>
