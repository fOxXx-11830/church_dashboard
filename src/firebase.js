// src/firebase.js
// Firebase 초기화 파일 - 환경 변수를 통해 민감한 정보를 보호합니다.
// Vite 프로젝트에서는 import.meta.env를 사용합니다.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// .env 파일에서 VITE_ 접두어가 붙은 값만 Vite가 클라이언트에 노출합니다.
// .env 파일 자체는 .gitignore에 의해 GitHub에 절대 올라가지 않습니다.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스
export const db = getFirestore(app);

export default app;

