import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
});

// 대시보드 데이터 조회
export const getDashboardData = async (period) => {
  const { data } = await api.get(`/admins/dashboards`, {
    params: {
      period,
    },
  });
  return data;
};

// 회원 조회
export const selectAllMember = async (params) => {
  const { data } = await api.get(`/admins/members`, {
    params,
  });
  return data;
};

// 일정 조회
export const selectAllSchedule = async (params) => {
  const { data } = await api.get(`/admins/schedules`, {
    params,
  });
  return data;
};

// 일정 공개 상태 변경
export const updateSchedulePublic = async (scheduleId) => {
  const { data } = await api.patch(`/admins/schedules/public/${scheduleId}`);
  return data;
};

// 일정 삭제
export const deleteSchedule = async (scheduleId) => {
  const { data } = await api.delete(`/admins/schedules/delete/${scheduleId}`);
  return data;
};
