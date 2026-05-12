import axios from "axios";

export const api = axios.create({
  baseURL: `http://${import.meta.env.VITE_BACKSERVER}`,
});

export const insertSchedule = async (post, images, detailSchedule) => {
  // key로 나눠서 formData에 모든 값을 넣음
  const formData = new FormData();

  // 날짜 변환
  const convertedPost = {
    ...post,
    startDate: new Date(post.startDate).toISOString(),
    endDate: new Date(post.endDate).toISOString(),
    recruitStartDate: new Date(post.recruitStartDate).toISOString(),
    recruitEndDate: new Date(post.recruitEndDate).toISOString(),
  };

  formData.append(
    "data",
    new Blob(
      [
        JSON.stringify({
          schedule: convertedPost,
          detailSchedule: detailSchedule,
          email: post.email,
        }),
      ],
      { type: "application/json" },
    ),
  );

  // 이미지파일 넣음
  images.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post("/schedules", formData);

  return response.data;
};
