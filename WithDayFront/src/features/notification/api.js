import axios from "axios";
import { useAuthStore } from "../auth/store/authStore";

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
});

// 인증에 필요한 토큰을 로그인 후 최신 토큰 반영
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  console.log("인터셉터 실행");
  console.log("토큰:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 알림 개수 조회
export const getNotificationCount = async () => {
  // 백엔드에서 현재 로그인한 사용자를 꺼내 그 사람의 알림만 조회하도록 설정
  const response = await api.get("/notifications/count", {
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
  });

  return response.data;
};

// 알림 조회
export const getNotifications = async () => {
  // 백엔드에서 현재 로그인한 사용자를 꺼내 그 사람의 알림만 조회하도록 설정
  const response = await api.get("/notifications", {
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
  });

  return response.data;
};

// 알림 읽음 처리
export const readNotification = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return response.data;
};

// 알림 조회
export const getNotificationTerm = async () => {
  // 백엔드에서 현재 로그인한 사용자를 꺼내 그 사람의 알림만 조회하도록 설정
  const response = await api.get("notification-term", {
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
  });

  return response.data;
};
