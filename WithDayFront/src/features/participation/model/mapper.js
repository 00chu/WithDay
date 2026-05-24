import { dayjs, formatDateRange, getDDay } from "../../../shared/lib/dateUtile";
import { PARTICIPATION_CATEGORY_LABELS } from "./constants";

export const normalizeParticipationStatus = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === "CANCELED") {
    return "CANCELLED";
  }

  return normalized;
};

const formatDisplayDateRange = (startDate, endDate) => {
  const formattedRange = formatDateRange(startDate, endDate);

  if (formattedRange === "일정 미정") {
    return "-";
  }

  return formattedRange;
};

const formatDisplayDDay = (startDate) => {
  if (!startDate) {
    return "-";
  }

  const dDay = getDDay(startDate);
  if (dDay) {
    return dDay;
  }

  const today = dayjs().startOf("day");
  const target = dayjs(startDate).startOf("day");

  if (target.isBefore(today)) {
    return "종료";
  }

  return "-";
};

const resolveSchedulePhase = ({
  endDate,
  recruitEndDate,
  scheduleStatus,
  startDate,
}) => {
  const today = dayjs().startOf("day");
  const normalizedStatus = scheduleStatus?.trim()?.toLowerCase() ?? "";
  const end = endDate ? dayjs(endDate).startOf("day") : null;
  const start = startDate ? dayjs(startDate).startOf("day") : null;
  const recruitEnd = recruitEndDate ? dayjs(recruitEndDate).startOf("day") : null;

  if (normalizedStatus === "cancelled") {
    return "취소됨";
  }

  if (normalizedStatus === "completed" || (end?.isValid() && end.isBefore(today))) {
    return "종료";
  }

  if (
    start?.isValid() &&
    (start.isSame(today) || start.isBefore(today)) &&
    (!end?.isValid() || end.isSame(today) || end.isAfter(today))
  ) {
    return "진행중";
  }

  if (normalizedStatus === "closed" || (recruitEnd?.isValid() && recruitEnd.isBefore(today))) {
    return "모집종료";
  }

  return "모집중";
};

export const normalizeMyScheduleItem = (item) => ({
  id: item.participationId ?? item.scheduleId,
  scheduleId: item.scheduleId,
  participationId: item.participationId,
  category: PARTICIPATION_CATEGORY_LABELS[item.category] ?? item.category ?? "기타",
  dDay: formatDisplayDDay(item.startDate),
  title: item.title ?? "-",
  location: item.location ?? "-",
  date: formatDisplayDateRange(item.startDate, item.endDate),
  currentPeople: item.currentPeople ?? 0,
  maxPeople: item.maxPeople ?? 0,
  dbStatus: normalizeParticipationStatus(item.dbStatus),
  scheduleStatus: item.scheduleStatus ?? "",
  recruitEndDate: item.recruitEndDate ?? "",
  schedulePhase: resolveSchedulePhase({
    endDate: item.endDate,
    recruitEndDate: item.recruitEndDate,
    scheduleStatus: item.scheduleStatus,
    startDate: item.startDate,
  }),
  myRole: item.host ? "host" : undefined,
  thumbnail: item.thumbnail ?? "",
});

export const normalizeParticipationApplicant = (item) => ({
  participationId: item.participationId,
  scheduleId: item.scheduleId,
  userId: item.userId,
  email: item.email ?? "",
  nickname: item.nickname ?? "-",
  status: normalizeParticipationStatus(item.status),
  createdAt: item.createdAt ?? "",
});

export const normalizeMySchedulesResponse = ({
  participating = [],
  pending = [],
  hosting = [],
} = {}) => ({
  participating: participating.map(normalizeMyScheduleItem),
  pending: pending.map(normalizeMyScheduleItem),
  hosting: hosting.map(normalizeMyScheduleItem),
});

export const normalizeScheduleApplicantsResponse = (items = []) =>
  items.map(normalizeParticipationApplicant);
