// 로그인/회원가입 UI와 서버 기록 연결을 켜고 끄는 단일 스위치.
// Vercel 배포에서는 값이 설정되지 않으면(undefined) 기본적으로 false(비활성화)입니다.
// 다시 켜려면 .env(로컬) 또는 Vercel 프로젝트 환경변수에 VITE_AUTH_ENABLED=true를 추가하세요.
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true'

// true일 때만 예시 일정/기록(mockData)을 화면에 보여줍니다. 공개 사이트 기본값은 false입니다.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
