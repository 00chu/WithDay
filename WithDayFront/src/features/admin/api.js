import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
});

export const selectAllMember = async (params) => {
  const { data } = await api.get(`/admins/members`, {
    params,
  });
  return data;
};

export const getDashboardData = async (period) => {
  const { data } = await api.get(`/admins/dashboards`, {
    params: {
      period,
    },
  });
  return data;
};

export const selectAllSchedule = async (params) => {
  const { data } = await api.get(`/admins/schedules`, {
    params,
  });
  return data;
};
