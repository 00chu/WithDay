import { api } from "../../auth/api";

export const getMypageEditData = async () => {
    const response = await api.get("/users/mypage/edit");

    return response.data;
};

export const updateMypageData = async (data) => {
    const response = await api.post("/users/mypage/edit", data);

    return response.data;
};