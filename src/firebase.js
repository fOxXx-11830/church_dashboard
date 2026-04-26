// src/firebase.js
// Firebase 초기화 파일 - 환경 변수를 통해 민감한 정보를 보호합니다.

import { initializeApp } from "firebase/app";

// 환경 변수에서 Firebase 설정값을 불러옵니다.
// 실제 값은 .env 파일에 저장되며, 이 파일은 절대 GitHub에 올라가지 않습니다.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

export default app;
