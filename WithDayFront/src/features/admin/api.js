import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
});

export const selectAllMember = async () => {
  const { data } = await api.get(`/admins/members`);
  return data;
};
