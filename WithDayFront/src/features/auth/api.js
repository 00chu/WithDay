import axios from 'axios';

const API_BASE_URL = `http://${import.meta.env.VITE_BACKSERVER}/api/users`;

// 회원가입 요청 API (formData를 직접 인자로 받음)
export const signupUser = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/signup`, formData, {
    headers: {
      // 💡 브라우저가 boundary를 자동으로 생성할 수 있도록 설정
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// 로그인 요청 API
export const loginUser = async (loginData) => {
  // 로그인 데이터는 여전히 JSON 형식이므로 그대로 유지
  const response = await axios.post(`${API_BASE_URL}/login`, loginData);
  return response.data; 
};