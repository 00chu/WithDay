import { api } from "../auth/api";

// 추천 일정 목록 조회
export const getRecommendedSchedules = async () => {
  const response = await api.get("/recommended-schedules");

  return response.data;
};

// 추천 일정 상세 조회
export const getRecommendedScheduleDetail = async (id) => {
  const response = await api.get(`/recommended-schedules/${id}`);

  return response.data;
};

// 추천 일정 생성
// JSON 데이터와 이미지 파일을 함께 보내야 하므로 FormData로 보냄.
export const createRecommendedSchedule = async ({
  recommendedData,
  images,
}) => {
  const formData = new FormData();

  // 백엔드 Controller의 @RequestPart("recommendedData")와 이름을 맞춤.
  formData.append(
    "recommendedData",
    new Blob([JSON.stringify(recommendedData)], {
      type: "application/json",
    }),
  );

  // 백엔드 Controller의 @RequestPart(value = "images")와 이름을 맞춤.
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  }

  const response = await api.post("/recommended-schedules", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// 추천 일정 삭제
export const deleteRecommendedSchedule = async (id) => {
  const response = await api.delete(`/recommended-schedules/${id}`);

  return response.data;
};
