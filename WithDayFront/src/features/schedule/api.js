import axios from 'axios';

// 환경 변수가 없을 때를 대비해 기본값(localhost)을 넣어주면 로컬 개발 시 에러를 방지할 수 있습니다.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10400";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🌟 수정됨: 하드코딩된 axios.get 대신, 위에서 만든 'api' 인스턴스를 사용합니다.
export const fetchScheduleDetail = async (scheduleId) => {
    // api 인스턴스는 이미 BASE_URL을 알고 있으므로 뒷부분 경로만 적어주면 됩니다.
    const { data } = await api.get(`/schedules/${scheduleId}`);
    return data;
};