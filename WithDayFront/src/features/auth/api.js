import axios from "axios";
import { useAuthStore } from "./store/authStore"; // 토큰을 꺼내오기 위해 전역 금고를 불러옴

// .env 파일에 숨겨둔 백엔드 주소 가져오기
const BASE_URL = import.meta.env.VITE_BACKSERVER;

// 💡 1. axios 전용 '커스텀 인스턴스' 생성
// 이제부터 백엔드랑 통신할 때는 기본 axios 말고, 기본 세팅이 끝난 이 'api'라는 요원을 쓸 겁니다.
export const api = axios.create({
  baseURL: `http://${BASE_URL}`, // 모든 요청 앞에 이 주소가 자동으로 붙음! (일일이 안 적어도 됨)
  headers: {
    "Content-Type": "application/json",
  },
});

// 💡 2. [초핵심] Axios 인터셉터 (통신 톨게이트)
// 프론트엔드에서 백엔드로 요청(Request)이 출발하기 '직전'에 무조건 여기를 거쳐갑니다.
api.interceptors.request.use(
  (config) => {
    // 1) 금고(Zustand)에서 현재 내 로그인 토큰을 꺼냄 (getState()는 리액트 컴포넌트 밖에서 store 값을 꺼낼 때 씁니다)
    const token = useAuthStore.getState().token;
    
    // 2) 토큰이 있다면?
    if (token) {
      // 3) 백엔드로 보내는 택배 상자(config)의 헤더에 'Authorization'이라는 이름표를 붙여서 토큰을 동봉함!
      // 이렇게 하면 API 함수 100개를 만들어도 일일이 토큰을 넣을 필요 없이 여기서 자동으로 다 넣어줌.
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config; // 세팅 완료된 택배 상자 출발!
  },
  (error) => {
    // 요청을 보내기 전에 뭔가 문제가 생기면 에러를 뱉음
    return Promise.reject(error);
  },
);


// ==========================================
// 3. 백엔드 통신 함수들 (React Query의 mutationFn/queryFn이 얘네를 가져다 씀)
// ==========================================

export const signupUser = async (formData) => {
  // 💡 사진 파일(profileImage)이 포함되어 있으므로, 톨게이트 기본 설정(json)을 무시하고 강제로 multipart/form-data로 덮어씌움!
  const response = await api.post(`/users/signup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 로그인은 파일 전송이 없으므로, 위에서 세팅한 api 요원을 그대로 써서 데이터만 던져주면 끝!
export const loginUser = async (loginData) => {
  const response = await api.post(`/users/login`, loginData);
  return response.data;
};

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