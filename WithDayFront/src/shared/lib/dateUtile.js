import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export function formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) return "일정 미정";

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    // 1. 시작일과 종료일이 같은 날인 경우
    if (start.isSame(end, "day")) {
        return start.format("YYYY.MM.DD");
    }

    // 🌟 2. 연도가 다를 경우 (해를 넘기는 일정) -> 종료일에도 연도 표시
    if (!start.isSame(end, "year")) {
        return `${start.format("YYYY.MM.DD")} - ${end.format("YYYY.MM.DD")}`;
    }

    // 3. 같은 연도, 다른 날짜인 경우
    return `${start.format("YYYY.MM.DD")} - ${end.format("MM.DD")}`;
}

export function getDDay(startDate) {
    if (!startDate) return null;

    const today = dayjs().startOf("day");
    const target = dayjs(startDate).startOf("day");
    const diff = target.diff(today, "day");

    if (diff < 0) return null; // 이미 지난 일정
    if (diff === 0) return "D-Day";
    return `D-${diff}`;
}

export const formatDate = (dateString, format = "YYYY.MM.DD") => {
    if (!dateString) return "미정";
    return dayjs(dateString).format(format);
};

export { dayjs };