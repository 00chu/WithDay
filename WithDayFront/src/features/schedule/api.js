import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKSERVER;

/*
 * 일정 관련 API 클라이언트다.
 * Home/Explore/ScheduleDetail 모두 같은 axios 인스턴스를 사용해 baseURL과 Authorization 헤더 규칙을 공유한다.
 */
export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
 * 일정 상세 API다.
 * email을 함께 보내면 백엔드가 viewerIsHost, viewerParticipationStatus, viewerCanAccessChatLink를 계산해준다.
 * 이 값들은 상세 페이지에서 참여 버튼 상태와 오픈채팅 링크 노출 여부를 결정하는 데 사용된다.
 */
export const fetchScheduleDetail = async (scheduleId, email = "") => {
  const normalizedEmail = email?.trim() ?? "";
  const { data } = await api.get(`/schedules/${scheduleId}`, {
    params: normalizedEmail ? { email: normalizedEmail } : {},
  });

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

/*
 * 호스트가 일정 실행 버튼을 눌렀을 때 호출하는 API다.
 * 요청 자체는 단순 POST지만, 서버에서는 아래 정책을 함께 검증한다.
 * - 요청자가 실제 호스트인지
 * - 최소 인원이 충족됐는지
 * - 현재 상태가 recruiting/closed인지
 *
 * 프론트는 "실행 요청"만 보내고, 상태 전이 가능 여부의 최종 판단은 서버에 맡긴다.
 */
export const completeSchedule = async ({ scheduleId, email }) => {
  const normalizedEmail = email?.trim() ?? "";
  const { data } = await api.post(`/schedules/${scheduleId}/complete`, null, {
    params: normalizedEmail ? { email: normalizedEmail } : {},
  });

  return data;
};

/*
 * 호스트가 실행 취소 버튼을 눌렀을 때 호출하는 API다.
 * 서버는 이 요청을 받아 completed -> recruiting 또는 completed -> closed 중 어느 쪽으로 갈지 결정한다.
 * 즉, 프론트는 복귀 상태를 계산하지 않고 "실행 취소 의도"만 전달한다.
 */
export const rollbackCompletedSchedule = async ({ scheduleId, email }) => {
  const normalizedEmail = email?.trim() ?? "";
  const { data } = await api.post(
    `/schedules/${scheduleId}/complete/rollback`,
    null,
    {
      params: normalizedEmail ? { email: normalizedEmail } : {},
    },
  );

  return data;
};

const normalizeRegionValue = (value) => value?.trim() ?? "";

/*
 * 홈/탐색 탭의 일정 리스트 API다.
 * 같은 GET /schedules 엔드포인트를 사용하지만, 홈은 category=all/keyword=""로 전체 목록을 받고,
 * 탐색은 사용자가 선택한 category/keyword/region을 params로 전달한다.
 */
export const fetchSchedules = async ({ category, keyword, region }) => {
  const params = {};

  // "전체" 카테고리는 백엔드 필터를 걸지 않는다는 의미라 category 파라미터를 생략한다.
  if (category && category !== "all") {
    params.category = category;
  }

  // 검색어는 submit된 값만 들어온다. 입력 중인 값은 SearchForm 내부 상태에 머문다.
  if (keyword) {
    params.keyword = keyword;
  }

  // Header 지역 선택값은 공백을 제거한 뒤, 값이 있을 때만 백엔드 region 필터로 보낸다.
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
    if (!date) return null;

    const d = new Date(date);

    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

export const updateSchedule = async (
  scheduleId,
  post,
  images,
  detailSchedule,
  deletedImageIds,
) => {
  const formData = new FormData();

  const formatDate = (date) => {
    if (!date) return null;

    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toISOString().split("T")[0];
  };

  const convertedPost = {
    ...post,
    startDate: formatDate(post.startDate),
    endDate: formatDate(post.endDate),
    recruitStartDate: formatDate(post.recruitStartDate),
    recruitEndDate: formatDate(post.recruitEndDate),
  };

  const payload = {
    email: post.email,
    schedule: convertedPost,
    detailSchedule: detailSchedule ?? [],
    deletedImageIds: deletedImageIds ?? [],
  };

  console.log("🔥 최종 payload", payload);

  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], {
      type: "application/json",
    }),
  );

  images.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.put(`/schedules/${scheduleId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteSchedule = async (scheduleId) => {
  const response = await api.delete(`/schedules/${scheduleId}`);

  return response.data;
};
