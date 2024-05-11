// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      tokenTelegramBot: "7000545613:AAF8Wn8o1nhLalZ82SnyqFdVWIg_ud2aGNI",
    },
  },
  ssr: true,
  devtools: { enabled: true },
  // app: {
  //   head: {
  //     link: [
  //       {
  //         rel: "manifest",
  //         href: "/manifest.webmanifest"
  //       }
  //     ]
  //   }
  // },
  modules: [
    "@nuxtjs/tailwindcss",
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

  pwa: {
    manifest: {
      name: "DAROM.pro",
      short_name: "DAROM.pro",
      description:
        "Лучший сервис для оформления заказа с Wildberries, Ozon и Яндекс Маркета",
      theme_color: "#ff7d00",
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
