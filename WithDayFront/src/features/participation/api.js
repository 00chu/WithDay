import { api } from "../../shared/lib/api";

const normalizeEmailParam = (email) => email?.trim() ?? "";

const debugMyScheduleResponse = (label, data) => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.debug(`[my-schedule] ${label}`, data);
};

export const fetchParticipationList = async ({ email, statuses }) => {
  const normalizedEmail = normalizeEmailParam(email);
  const { data } = await api.get("/participations/me", {
    params: {
      email: normalizedEmail,
      statuses,
    },
  });

  debugMyScheduleResponse(`participations ${statuses}`, data);

  return data;
};

export const fetchHostingSchedules = async ({ email }) => {
  const normalizedEmail = normalizeEmailParam(email);
  const { data } = await api.get("/participations/me/hosting", {
    params: { email: normalizedEmail },
  });

  debugMyScheduleResponse("hosting", data);

  return data;
};

export const fetchMySchedules = async ({ email }) => {
  const [participating, pending, hosting] = await Promise.all([
    fetchParticipationList({ email, statuses: "APPROVED,KICKED" }),
    fetchParticipationList({ email, statuses: "PENDING,REJECTED,CANCELLED" }),
    fetchHostingSchedules({ email }),
  ]);

  return {
    participating,
    pending,
    hosting,
  };
};

export const applySchedule = async ({ email, scheduleId }) => {
  const { data } = await api.post("/participations", {
    email,
    scheduleId,
  });

  return data;
};

export const createParticipation = applySchedule;

export const fetchScheduleApplicants = async ({
  scheduleId,
  email,
  status = "PENDING",
}) => {
  const { data } = await api.get(
    `/participations/schedules/${scheduleId}/applicants`,
    {
      params: {
        email,
        status,
      },
    }
  );

  return data;
};

export const updateParticipationStatusByHost = async ({
  participationId,
  email,
  status,
  reason = "",
}) => {
  const { data } = await api.patch(
    `/participations/${participationId}/status`,
    {
      email,
      status,
      reason,
    }
  );

  return data;
};

export const updateParticipationStatus = async ({
  participationId,
  email,
  action,
}) => {
  if (action === "cancel") {
    const { data } = await api.patch(
      `/participations/${participationId}/cancel`,
      null,
      {
        params: { email },
      }
    );
    return data;
  }

  if (action === "delete") {
    const { data } = await api.delete(`/participations/${participationId}`, {
      params: { email },
    });
    return data;
  }

  throw new Error("지원하지 않는 참여 상태 변경입니다.");
};

export const cancelParticipation = async ({ participationId, email }) => {
  return updateParticipationStatus({
    participationId,
    email,
    action: "cancel",
  });
};

export const deleteParticipation = async ({ participationId, email }) => {
  return updateParticipationStatus({
    participationId,
    email,
    action: "delete",
  });
};
