import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,      // JWT 토큰 저장
      user: null,       // 유저 정보 (이메일, 닉네임 등) 저장
      isLoggedIn: false, // 로그인 여부

      // 로그인 시 호출할 함수
      setLogin: (token, userData) => set({
        token: token,
        user: userData,
        isLoggedIn: true,
      }),

      // 로그아웃 시 호출할 함수
      setLogout: () => set({
        token: null,
        user: null,
        isLoggedIn: false,
      }),
    }),
    {
      name: 'auth-storage', // 로컬 스토리지에 저장될 이름
    }
  )
);