import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// AUTH_ENABLED=false일 때 로그인 UI/기능은 아예 호출되지 않지만, 앱 전체가 게스트 화면을 그리기 전에
// Firebase 설정 문제로 멈추지 않도록 초기화 실패를 여기서 흡수합니다. AUTH_ENABLED=true로 되돌리려면
// 유효한 VITE_FIREBASE_* 값만 채우면 되고, 아래 로직은 그대로 정상 동작합니다.
let app, auth, db
try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} catch {
  auth = null
  db = null
}

export { auth, db }
