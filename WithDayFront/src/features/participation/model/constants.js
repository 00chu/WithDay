export const PARTICIPATION_CATEGORY_LABELS = {
  travel: "여행",
  popup: "팝업",
  food: "식사",
  activity: "액티비티",
  culture: "문화",
  etc: "기타",
};

export const PARTICIPATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  KICKED: "KICKED",
};

export const HOST_APPLICANT_STATUS_FILTERS = [
  { value: "PENDING", label: "대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "거절" },
  { value: "CANCELLED", label: "취소" },
];

export const PARTICIPATION_TABS = [
  { value: "participating", label: "참여중" },
  { value: "pending", label: "신청중" },
  { value: "hosting", label: "내가 만든 일정" },
];

export const PARTICIPATION_TAB_STATUS_PARAMS = {
  participating: "APPROVED,KICKED",
  pending: "PENDING,REJECTED,CANCELLED",
};

export const PARTICIPATION_STATUS_META = {
  host: {
    badgeText: "호스트",
    badgeClass: "badgeHost",
    buttonText: "일정 관리",
    buttonVariant: "accent",
    actionType: "manage",
    cardDisabled: false,
    isDisabled: false,
  },
  PENDING: {
    badgeText: "신청중",
    badgeClass: "badgePending",
    buttonText: "신청 취소",
    buttonVariant: "accent",
    actionType: "cancel",
    cardDisabled: false,
    isDisabled: false,
  },
  APPROVED: {
    badgeText: "참여 확정",
    badgeClass: "badgeApproved",
    buttonText: "상세보기",
    buttonVariant: "accent",
    actionType: "view",
    cardDisabled: false,
    isDisabled: false,
  },
  REJECTED: {
    badgeText: "거절됨",
    badgeClass: "badgeError",
    buttonText: "삭제",
    buttonVariant: "accent",
    actionType: "delete",
    cardDisabled: true,
    isDisabled: false,
  },
  CANCELLED: {
    badgeText: "취소됨",
    badgeClass: "badgeGray",
    buttonText: "상세보기",
    buttonVariant: "outline",
    actionType: "view",
    cardDisabled: true,
    isDisabled: false,
  },
  KICKED: {
    badgeText: "내보내짐",
    badgeClass: "badgeError",
    buttonText: "삭제",
    buttonVariant: "accent",
    actionType: "delete",
    cardDisabled: true,
    isDisabled: false,
  },
  default: {
    badgeText: "상태 없음",
    badgeClass: "badgeGray",
    buttonText: "-",
    buttonVariant: "outline",
    actionType: "disabled",
    cardDisabled: true,
    isDisabled: true,
  },
};

export const getParticipationStatusMeta = (status, myRole) => {
  if (myRole === "host") {
    return PARTICIPATION_STATUS_META.host;
  }

  return PARTICIPATION_STATUS_META[status] ?? PARTICIPATION_STATUS_META.default;
};
