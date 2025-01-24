import { initializeApp, getApps } from "firebase/app";
import { getMessaging, onMessage, type Messaging } from "firebase/messaging";

declare module "#app" {
  interface NuxtApp {
    $messaging: Messaging;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $messaging: Messaging;
  }
}

export default defineNuxtPlugin(() => {
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: "AIzaSyDXooTcaUHHUHe8Pwlmg8Ua3zwA0nWxuqw",
      authDomain: "darom-pro-messages.firebaseapp.com",
      projectId: "darom-pro-messages",
      storageBucket: "darom-pro-messages.appspot.com",
      messagingSenderId: "633883773284",
      appId: "1:633883773284:web:5df79ceef6d300e236d271",
      measurementId: "G-GC3VTLSR3S",
    });

  if (typeof navigator.serviceWorker !== "undefined") {
    const messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      alert(JSON.stringify(payload, null, 2));
    });

    return {
      provide: {
        messaging,
      },
    };
  } else {
    console.warn("Service Worker is not supported in this browser.");
  }
});
