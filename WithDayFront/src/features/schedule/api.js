import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
});

export const fetchScheduleDetail = async (scheduleId) => {
  const { data } = await api.get(`/schedules/${scheduleId}`);

  if (import.meta.env.DEV) {
    console.debug("[schedule-detail] response", data);
  }

  return data;
};

// 조회수 증가는 상세 조회와 분리해서 호출한다.
// 이렇게 해두면 상세 GET 요청이 캐시되거나 재시도될 때 조회수가 함께 흔들리지 않는다.
export const incrementScheduleViewCount = async (scheduleId) => {
  await api.post(`/schedules/${scheduleId}/view`);
};

const normalizeRegionValue = (value) => value?.trim() ?? "";

export const fetchSchedules = async ({ category, keyword, region }) => {
  const params = {};

  // 🌟 "all"이 아닐 때만 백엔드로 카테고리 파라미터를 보냄
  if (category && category !== "all") {
    params.category = category;
  }

  if (keyword) {
    params.keyword = keyword;
  }

  const normalizedRegion = normalizeRegionValue(region);
  if (normalizedRegion) {
    params.region = normalizedRegion;
  }

  const { data } = await api.get("/schedules", { params });
  console.log("API 응답 데이터:", data); // 디버깅용 로그
  return data;
};

export const insertSchedule = async (post, images, detailSchedule) => {
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
