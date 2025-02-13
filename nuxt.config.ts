// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    merchantId: "MA0003333883",
    accountId: "40802810601500007607/044525104",
    tokenQR:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJ0WmxGcEtVRmNWQTMzZnJIWEI2OXdWNFhyWXFTZ2lYOCJ9.Def-wRz3jyqv1_Mm8UwB4qdvoznQFlzAbftK0nvOhZPXeMN2nu95lYRGsQNEGUlGmTXgFN5kHpNUJHMESQRAQ3Qnlcv4-bY363NnbuKbieBvGTgBjKXiv3HbS1rJe_rLIfM8cRNaJBWs12D6XaMMdm2CvJgGO1Z1edepJaoJaJjZbmGLHeaxrkJ9ZqvTxapNHKlNzSNMoJb8mjXFWz_ex0P3LbF4iFq5aygPNcICuRIXxLp5yAPVJgCL-5vNDF1Ofy9RqSaDb_Ycvy7CLtv0o4SJihe1OkGqcUlP_1CYw0aQ_vVfzOqdvp1zsyhFUdtRyhkQPj-G2tNt6rq1QZ53lPnOt1TWSR8lV0v5UC040QFc_31AHvA6KKVukS64TOxhYG5lMCj7MdNFR2w4QXxHKtLTGErlmHcE-5ReJX80nujxi2K5UMl5jPz5o6BTEkfVkTB398p-lgLKhaOnSrZ6Z-HgBg0w79hp8xCtgc4gdnq0N74xzVrWu-6NdBj_dZ7i",
    jwtSecretKey: process.env.JWT_SECRET_KEY_FOURSSAN,
    public: {
      tokenTelegramBot: "7000545613:AAF8Wn8o1nhLalZ82SnyqFdVWIg_ud2aGNI",
      adminToken:
        "WrZtQutpeGTBVvs6pJs2WoJ0ls4BXtf3RiyWwyBglFcCXiTBOMMY08gfJbQ8RGcIYmdxgJvjXrFcJOQgYsqAQlvX1e2LjmS57eOGXHrzSXhEkyrxEkld4tFfMBwFb8O2sDzEaow02p21raWfeJEW4X78SUzhHmcBHY836SbveuSF4cJTCMoELsMeojAEmpdEL2XZg5kSGM32AVbtXCqdbGjpcE8WQJUllzfYdUbAEwR1fFia155BpdEwkl43Tuex",
      encryptionKeyFourssan: process.env.ENCRYPTION_KEY_FOURSSAN,
    },
  },
  ssr: true,
  devtools: { enabled: true },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  modules: [
    "@pinia/nuxt",
    "nuxt-icon",
    "@nuxtjs/supabase",
    "@vite-pwa/nuxt",
    "nuxt-swiper",
    "@formkit/auto-animate/nuxt",
    [
      "nuxt-vuefire",
      {
        config: {
          apiKey: "AIzaSyDXooTcaUHHUHe8Pwlmg8Ua3zwA0nWxuqw",
          authDomain: "darom-pro-messages.firebaseapp.com",
          projectId: "darom-pro-messages",
          storageBucket: "darom-pro-messages.appspot.com",
          messagingSenderId: "633883773284",
          appId: "1:633883773284:web:5df79ceef6d300e236d271",
          measurementId: "G-GC3VTLSR3S",
        },
      },
    ],
    "@nuxt/ui",
    "@nuxt/image",
  ],
  swiper: {
    styleLang: "css",
  },
  colorMode: {
    preference: "light",
  },
  supabase: {
    redirect: false,
  },
  css: ["~/assets/css/main.css"],
  build: {
    transpile: ["vue-toastification"],
  },
  pwa: {
    manifest: {
      name: "Доставка товаров",
      short_name: "Доставка товаров",
      description:
        "Лучший сервис для доставки товаров с Wildberries, Ozon и др.",
      theme_color: "#ff7d00",
      background_color: "#000000",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },
});
