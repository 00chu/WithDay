import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 핵심: 새로고침 방지용 미들웨어

// 브라우저의 로컬 스토리지에 저장될 이름표 (개발자 도구 -> Application 탭에서 확인 가능)
export const AUTH_STORAGE_KEY = 'auth-storage';

// 💡 전역 금고(Store) 생성
export const useAuthStore = create(
  // persist: 이 금고의 내용을 브라우저의 localStorage에 '자동 저장(영구 보존)' 해주는 마법의 기능!
  // 덕분에 유저가 F5(새로고침)를 누르거나 브라우저를 껐다 켜도 로그인이 풀리지 않음.
  persist(
    (set) => ({
      // 1. 금고 안에 들어갈 초기 데이터들
      token: null,
      user: null,
      isLoggedIn: false, // 로그인 여부를 한 번에 알 수 있는 판독기

      // 2. 로그인 성공 시 금고 데이터를 꽉꽉 채우는 함수 (Login.jsx에서 사용함)
      setLogin: (token, userData) =>
        set({
          token, // 백엔드에서 받아온 토큰 저장
          user: userData ?? null, // userData가 비어있으면 null 저장 (?? : 널 병합 연산자)
          // 토큰도 있고 유저 이메일도 있으면 true, 아니면 false로 저장하여 로그인 상태 확정
          isLoggedIn: Boolean(token && userData?.email),
        }),

      // 3. 로그아웃 시 금고를 텅텅 비우는 함수 (로그아웃 버튼 누를 때 사용)
      setLogout: () =>
        set({
          token: null,
          user: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY, // 로컬 스토리지에 저장될 키값 지정
    }
  )
);