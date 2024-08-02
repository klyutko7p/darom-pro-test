importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js"
);

const app = firebase.initializeApp({
  apiKey: "AIzaSyDXooTcaUHHUHe8Pwlmg8Ua3zwA0nWxuqw",
  authDomain: "darom-pro-messages.firebaseapp.com",
  projectId: "darom-pro-messages",
  storageBucket: "darom-pro-messages.appspot.com",
  messagingSenderId: "633883773284",
  appId: "1:633883773284:web:5df79ceef6d300e236d271",
  measurementId: "G-GC3VTLSR3S",
});

let messaging;
try {
  messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    console.log("Received a bg message: ", payload);

    const title = payload.notification.title;
    const notification = {
      body: "Статус заказа: Darom.pro",
      icon: "pwa-512x512.png",
    };

    self.registration.showNotification(title, notification);
  });
} catch (err) {
  console.error("Failed to initialize Firebase Messaging", err);
}
