import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export function formatDateRange(startDate, endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (start.isSame(end, "day")) {
        return start.format("YYYY.MM.DD");
    }
    return `${start.format("YYYY.MM.DD")} - ${end.format("MM.DD")}`;
}

export function getDDay(startDate) {
    const today = dayjs().startOf("day");
    const target = dayjs(startDate).startOf("day");
    const diff = target.diff(today, "day");
    if (diff < 0) return null;
    if (diff === 0) return "D-Day";
    return `D-${diff}`;
}

// fromNow를 쓰기 위해 dayjs 객체 자체도 export 해줍니다.
export { dayjs };