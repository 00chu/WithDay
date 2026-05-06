import axios from 'axios';
import { useAuthStore } from './store/authStore'; // 💡 본인의 authStore 파일 경로에 맞게 꼭 수정해 줘!

// 1. 커스텀 Axios 인스턴스 생성
// 앞으로 그냥 axios.post 대신 api.post를 사용하게 될 거야.
export const api = axios.create({
  baseURL: `http://${import.meta.env.VITE_BACKSERVER}`, // 백엔드 기본 주소
  headers: {
    'Content-Type': 'application/json',
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
      // 'Bearer '는 JWT 토큰을 보낼 때 사용하는 국제 표준 약속(규격)이야.
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; // 장착이 끝난 요청을 서버로 출발시킴
  },
  (error) => {
    // 요청 준비 과정에서 에러가 났을 때 처리
    return Promise.reject(error);
  }
);

// 3. 기존 API 함수들 수정
// 이제 기본 axios가 아니라, 위에서 우리가 만든 'api' 인스턴스를 사용해!

export const signupUser = async (formData) => {
  const response = await api.post(`/api/users/signup`, formData, {
    headers: {
      // 파일 업로드를 위해 여기만 예외적으로 multipart/form-data로 덮어씌움
      'Content-Type': 'multipart/form-data' 
    }
  });
  return response.data;
};

export const loginUser = async (loginData) => {
  // api 인스턴스에 이미 baseURL이 설정되어 있으므로 뒷부분 경로만 적어주면 됨
  const response = await api.post(`/api/users/login`, loginData);
  return response.data; 
};

// 💡 4. 약관 데이터 불러오기 함수 추가!
export const fetchTerms = async () => {
  // GET 요청으로 백엔드에서 약관 목록을 가져옵니다.
  const response = await api.get(`/api/users/terms`);
  return response.data;
};