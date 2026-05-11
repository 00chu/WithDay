import axios from "axios";

export const api = axios.create({
  baseURL: `http://${import.meta.env.VITE_BACKSERVER}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const insertSchedule = async (post, images, detailSchedule) => {
  // key로 나눠서 formData에 모든 값을 넣음
  const formData = new FormData();

  // json을 파일처럼 만들어 multipart에 넣음
  formData.append(
    "postData",
    new Blob([JSON.stringify(post)], { type: "application/json" }),
  );

  // 세부 일정 넣음
  formData.append(
    "detailSchedule",
    new Blob([JSON.stringify(detailSchedule)], {
      type: "application/json",
    }),
  );

  // 이미지파일 넣음
  images.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post("/schedules/insert-schedule", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
};
