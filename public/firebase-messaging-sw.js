importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDhtnW45ihsEeNYfg7VF3J4W18bEqM_IY0",
  authDomain: "gen-lang-client-0110435017.firebaseapp.com",
  projectId: "gen-lang-client-0110435017",
  storageBucket: "gen-lang-client-0110435017.firebasestorage.app",
  messagingSenderId: "17396827489",
  appId: "1:17396827489:web:e726f5e57aa99d3629b120"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/trees.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
