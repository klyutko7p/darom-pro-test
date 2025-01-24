import plugin from "vue-yandex-maps";
import { defineNuxtPlugin } from "nuxt/app";

const settings = {
  apiKey: "8898e4be-0b36-4bc9-9646-4a7fa89c96f7", // Индивидуальный ключ API
  lang: "ru_RU", // Используемый язык
  coordorder: "latlong", // Порядок задания географических координат
  version: "2.1", // Версия Я.Карт
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(plugin, settings);
});
