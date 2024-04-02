// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "nuxt-icon",
    "@nuxtjs/supabase",
    "@vite-pwa/nuxt",
    "nuxt-swiper",
    "@formkit/auto-animate/nuxt",
  ],

  swiper: {
    styleLang: "css",
  },
  supabase: {
    redirect: false,
  },
  css: ["~/assets/css/main.css"],
  build: {
    transpile: ["vue-toastification"],
  },
});
