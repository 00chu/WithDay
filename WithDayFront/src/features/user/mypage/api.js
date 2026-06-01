import { api } from "../../auth/api";

// 마이페이지 조회용
export const getMypageData = async () => {
    const response = await api.get("/users/mypage/edit");

    return response.data;
};

export const getMypageEditData = async () => {
    const response = await api.get("/users/mypage/edit");

    return response.data;
};

export const updateMypageData = async (data) => {
    const response = await api.post("/users/mypage/edit", data);

    return response.data;
};

export const uploadMypageProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("profileFile", file);

    const response = await api.post("/users/mypage/profile-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};