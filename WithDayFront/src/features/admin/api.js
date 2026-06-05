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

// 약관 목록 조회
export const getAdminTerms = async () => {
  const { data } = await api.get("/admins/terms");
  return data;
};

// 약관 수정
export const updateAdminTerms = async ({ id, version, content }) => {
  const { data } = await api.put(`/admins/terms/${id}`, {
    version,
    content,
  });

  return data;
};

// 관심사 목록 조회
export const getAdminInterests = async () => {
  const { data } = await api.get("/admins/interests");
  return data;
};

// 관심사 추가
export const createAdminInterest = async ({ interestName, iconName }) => {
  const { data } = await api.post("/admins/interests", {
    interestName,
    iconName,
  });

  return data;
};

// 관심사 수정
export const updateAdminInterest = async ({ id, interestName, iconName }) => {
  const { data } = await api.put(`/admins/interests/${id}`, {
    interestName,
    iconName,
  });

  return data;
};

// 관심사 삭제
export const deleteAdminInterest = async (id) => {
  const { data } = await api.delete(`/admins/interests/${id}`);
  return data;
};