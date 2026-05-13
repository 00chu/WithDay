import axios from "axios";
import { useAuthStore } from "./store/authStore";

const BASE_URL = import.meta.env.VITE_BACKSERVER;

// 1. 커스텀 Axios 인스턴스 생성
// 앞으로 그냥 axios.post 대신 api.post를 사용하게 될 거야.
export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터 (Request Interceptor) - 서버로 출발하기 직전!
api.interceptors.request.use(
  (config) => {
    // 💡 왜 훅을 안 쓰고 getState()를 쓸까?
    // api.js는 React 컴포넌트(JSX)가 아닌 일반 JavaScript 파일이야.
    // 일반 JS 파일에서는 useAuthStore() 같은 React Hook을 호출할 수 없기 때문에,
    // Zustand가 제공하는 getState() 메서드를 써서 금고의 현재 상태값을 직접 빼오는 거야.
    const token = useAuthStore.getState().token;

    // 토큰이 존재하면 헤더에 장착
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 준비 과정에서 에러가 났을 때 처리
    return Promise.reject(error);
  },
);

// 3. 기존 API 함수들 수정
// 이제 기본 axios가 아니라, 위에서 우리가 만든 'api' 인스턴스를 사용해!

export const signupUser = async (formData) => {
  const response = await api.post(`/users/signup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await api.post(`/users/login`, loginData);
  return response.data;
};

// 💡 4. 약관 데이터 불러오기 함수 추가!
export const fetchTerms = async () => {
  const response = await api.get(`/users/terms`);
  return response.data;
};

export const googleLoginUser = async (googleData) => {
  const response = await api.post(`/users/google-login`, googleData);
  return response.data;
};

export const sendEmailVerification = async (email) => {
  const response = await api.post(`/users/email-verification`, { email });
  return response.data;
};

export const socialSignupUser = async (signupData) => {
  const response = await api.post(`/users/social-signup`, signupData);
  return response.data;
};