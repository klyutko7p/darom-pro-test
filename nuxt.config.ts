// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    merchantId: "MA0003333883",
    accountId: "40802810601500007607/044525104",
    tokenQR:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJ0WmxGcEtVRmNWQTMzZnJIWEI2OXdWNFhyWXFTZ2lYOCJ9.Def-wRz3jyqv1_Mm8UwB4qdvoznQFlzAbftK0nvOhZPXeMN2nu95lYRGsQNEGUlGmTXgFN5kHpNUJHMESQRAQ3Qnlcv4-bY363NnbuKbieBvGTgBjKXiv3HbS1rJe_rLIfM8cRNaJBWs12D6XaMMdm2CvJgGO1Z1edepJaoJaJjZbmGLHeaxrkJ9ZqvTxapNHKlNzSNMoJb8mjXFWz_ex0P3LbF4iFq5aygPNcICuRIXxLp5yAPVJgCL-5vNDF1Ofy9RqSaDb_Ycvy7CLtv0o4SJihe1OkGqcUlP_1CYw0aQ_vVfzOqdvp1zsyhFUdtRyhkQPj-G2tNt6rq1QZ53lPnOt1TWSR8lV0v5UC040QFc_31AHvA6KKVukS64TOxhYG5lMCj7MdNFR2w4QXxHKtLTGErlmHcE-5ReJX80nujxi2K5UMl5jPz5o6BTEkfVkTB398p-lgLKhaOnSrZ6Z-HgBg0w79hp8xCtgc4gdnq0N74xzVrWu-6NdBj_dZ7i",
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
  ],
  icon: {
    clientBundle: {
      icons: [
        "i-ic-round-menu",
        "pepicons-print:exclamation",
        "material-symbols:cancel-schedule-send",
        "material-symbols:close-small-outline-rounded",
        "material-symbols:call",
        "fluent:eye-show-16-filled",
        "fluent:eye-hide-20-filled",
        "material-symbols:delete-rounded",
        "material-symbols:gpay",
        "gridicons:multiple-users",
        "i-material-symbols-package-2",
        "material-symbols:refresh-rounded",
        "ion:ios-arrow-back",
        "material-symbols:add",
        "material-symbols-light:add-circle-rounded",
        "i-heroicons-x-mark-20-solid",
        "ic:baseline-mode-edit",
        "ic:round-delete",
        "material-symbols:person-add-outline-rounded",
        "material-symbols:attach-money-rounded",
        "material-symbols:person-edit-outline",
        "material-symbols:person-remove-outline",
        "i-heroicons-calendar-days-20-solid",
        "material-symbols:arrow-back-ios-new-rounded",
        "material-symbols:arrow-forward-ios-rounded",
        "bi:filetype-xlsx",
        "mdi:checkbox-multiple-marked-circle",
        "material-symbols:settings-rounded",
        "i-material-symbols-light-close-rounded",
        "i-heroicons-magnifying-glass-20-solid",
        "mingcute:qrcode-fill",
        "lucide:boxes",
        "material-symbols:finance-rounded",
        "i-mage-delivery-truck-fill",
        "i-material-symbols-contextual-token-add",
        "i-material-symbols-settings-account-box-rounded",
        "i-majesticons-door-exit",
        "ic:round-keyboard-backspace",
        "icon-park-solid:buy",
        "material-symbols:lock-person-rounded",
        "ic:baseline-assignment-return",
        "material-symbols-light:account-balance-wallet",
        "icon-park-solid:table-report",
        "material-symbols:table-chart",
        "i-solar-ruble-bold",
        "i-icon-park-solid-connection-point",
        "i-material-symbols-add-location-rounded",
        "material-symbols:add-task",
        'i-mdi-truck-delivery"',
        "material-symbols:table-chart-view",
        "i-ph-users-fill",
        "i-solar-shop-2-bold",
        "i-streamline-contact-phonebook-2-solid",
        "i-fluent-table-cells-split-28-filled",
        "i-material-symbols-quick-reorder-rounded",
        "i-material-symbols-shield-person",
        "i-material-symbols-order-approve-rounded",
        "i-material-symbols-shopping-cart",
        "i-material-symbols-light-shopping-bag",
        "streamline:money-cash-bill-3-accounting-billing-payment-finance-cash-currency-money-bill",
        "uil:transaction",
        "eos-icons:bubble-loading",
        "material-symbols:cancel-presentation",
        "material-symbols:cancel-rounded",
        "i-heroicons-pencil-square",
        "streamline:money-wallet-money-payment-finance-wallet",
        "logos:telegram",
        "logos:whatsapp-icon",
        "mdi:vk",
        "ic:baseline-telegram",
        "material-symbols:add-alert",
        "ci:users",
        "gravity-ui:circle-ruble",
        "solar:money-bag-bold",
        "clarity:employee-line",
        "tdesign:money",
        "hugeicons:credit-card-pos",
        "material-symbols:file-copy-outline-rounded",
        "i-heroicons-folder",
        "icon-park-solid:folder-success",
        "iconoir:hand-cash",
        "hugeicons:credit-card-validation",
        "ic:round-remove-red-eye",
        "i-heroicons-arrow-left-20-solid",
        "i-heroicons-arrow-right-20-solid",
        "material-symbols:contact-phone-rounded",
        "i-mdi-package-variant-closed-plus",
        "i-solar-skip-next-bold",
        "solar:box-bold-duotone",
        "material-symbols:perm-data-setting-outline-rounded",
        "i-octicon-tracked-by-closed-completed-16",
        "i-line-md-circle-to-confirm-circle-transition",
        "i-material-symbols-arrow-warm-up-rounded",
        "i-line-md-map-marker-multiple-alt",
        "i-svg-spinners-clock",
        "i-line-md-uploading-loop",
        "i-eos-icons-hourglass",
      ],
      scan: true,
      includeCustomCollections: true,
      sizeLimitKb: 512,
    },
  },
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
      name: "DAROM.PRO",
      short_name: "DAROM.PRO",
      description:
        "Лучший сервис для доставки товаров с Wildberries, Ozon, Яндекс Маркета и др.",
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
