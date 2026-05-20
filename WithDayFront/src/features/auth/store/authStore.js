import { create } from 'zustand'; // zustand에서 create 함수를 가져옴. (토큰 저장소 만들 때 사용)
import { persist } from 'zustand/middleware'; // 새로고침 방지용

// 브라우저의 로컬 스토리지에 저장될 이름 (개발자 도구 -> Application 탭에서 확인 가능, "auth-storage"라는 이름으로 저장됨)
export const AUTH_STORAGE_KEY = 'auth-storage';

// 전역 Store 생성
export const useAuthStore = create(
  // persist: 새로고침(F5)을 누르면 리액트 데이터가 날아가는 단점을 방어하는 자동 백업 장치. 데이터를 브라우저의 로컬 스토리지에 영구 보존해서, 창을 껐다 켜도 로그인이 풀리지 않게 해줌!
  persist(
    (set) => ({
      // Store 안에 들어갈 초기 데이터들
      token: null,
      user: null,
      isLoggedIn: false, // 로그인 여부

      // 로그인 성공 시 Store 데이터를 채우는 함수 (Login.jsx에서 사용함)
      setLogin: (token, userData) =>
        set({
          token, // 백엔드에서 받아온 토큰 저장
          user: userData ?? null, // userData가 비어있으면 null 저장. 비어있을수가 없긴한데 혹여나 오류로 userData가 안 들어오는 경우(이때 undefined를 넣음)를 대비해서 null로 저장하게 함.
          // 토큰도 있고 유저 이메일도 있으면 true, 아니면 false로 저장하여 로그인 상태 저장
          isLoggedIn: Boolean(token && userData?.email),
        }),

      // 로그아웃 시 Store를 비우는 함수 (로그아웃 버튼 누를 때 사용)
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