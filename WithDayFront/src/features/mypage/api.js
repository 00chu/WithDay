import axios from "axios";
const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
    baseURL: `http://${BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getMypageData = async (email) => {
    const res = await api.get("/user/mypage", {
        params: { email },
    });

    return res.data;
};

export const updateMypageData = async (data) => {
    const res = await api.post("/user/mypage/edit", data);

    return res.data;
};