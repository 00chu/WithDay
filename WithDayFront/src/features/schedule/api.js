import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
    baseURL: `http://${BASE_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchScheduleDetail = async (scheduleId) => {
    const { data } = await api.get(`/schedules/${scheduleId}`);
    return data;
};

export const fetchSchedules = async ({ category, keyword }) => {
    const params = {};

    // 🌟 "all"이 아닐 때만 백엔드로 카테고리 파라미터를 보냄
    if (category && category !== "all") {
        params.category = category;
    }

    if (keyword) {
        params.keyword = keyword;
    }

    const { data } = await api.get("/schedules", { params });
    console.log("API 응답 데이터:", data); // 디버깅용 로그
    return data;
};