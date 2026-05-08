import axios from 'axios';

export const api = axios.create({
    baseURL: `http://${import.meta.env.VITE_BACKSERVER}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const insertSchedule = async (post) => {
  const response = await api.post(`/schedules/insert-schedule`, post, {
    headers: {
      // 파일 업로드를 위해 여기만 예외적으로 multipart/form-data로 덮어씌움
      'Content-Type': 'multipart/form-data' 
    }
  });
  return response.data;
};