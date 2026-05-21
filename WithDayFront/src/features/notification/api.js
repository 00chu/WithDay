import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
});

// 알림 조회
export const fetchNotifications = async () => {
  // 백엔드에서 현재 로그인한 사용자를 꺼내 그 사람의 알림만 조회하도록 설정
  const response = await api.get("/notifications");

  return response.data;
};

// 알림 읽음 처리
export const readNotification = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return response.data;
};
