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

export const insertSchedule = async (post, images, detailSchedule) => {
  // key로 나눠서 formData에 모든 값을 넣음
  const formData = new FormData();

  const formatDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // 시간 초기화
    return d.toISOString().slice(0, 19).replace("T", " ");
  };

  // 날짜 변환
  const convertedPost = {
    ...post,
    startDate: formatDate(post.startDate),
    endDate: formatDate(post.endDate),
    recruitStartDate: formatDate(post.recruitStartDate),
    recruitEndDate: formatDate(post.recruitEndDate),
  };

  console.log(post);
  console.log(images);
  console.log(detailSchedule);

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
