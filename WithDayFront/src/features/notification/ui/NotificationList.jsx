import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchNotifications, readNotification } from "../api";
import styles from "./Notification.module.css";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export default function NotificationList({ onClose }) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  if (isLoading) {
    return <div className={styles.empty}>불러오는 중...</div>;
  }

  if (notifications.length === 0) {
    return <div className={styles.empty}>새로운 알림이 없습니다.</div>;
  }

  const handleClickNotification = async (notification) => {
    // 알림 읽음 처리
    await readNotification(notification.id);

    // 알림 목록 다시 불러오기
    await queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });

    onClose();

    // 참가 신청 알림 -> 신청중 탭
    if (notification.type === "APPLY") {
    }

    // 승인 알림 -> 참여중 탭
    if (notification.type === "APPROVE") {
      navigate("/my-schedule", {
        state: {
          activeTab: "participating",
        },
      });

      return;
    }

    // 거절/추방 -> 신청중 탭
    if (notification.type === "REJECT" || notification.type === "KICK") {
      navigate("/my-schedule", {
        state: {
          activeTab: "pending",
        },
      });

      return;
    }

    // 기본 이동
    navigate(notification.targetUrl);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleClickNotification(notification)}
          className={
            notification.isRead ? styles.readNotification : styles.notification
          }
        >
          <span className={styles.iconBox}>
            <CalendarTodayIcon></CalendarTodayIcon>
          </span>
          <div className={styles.content}>
            <p className={styles.message}>{notification.message}</p>
            <p className={styles.title}>"{notification.title}"</p>
          </div>

          <div className={styles.right}>
            <span className={styles.date}>
              {formatDate(notification.createdAt)}
            </span>

            <button
              className={styles.closeBtn}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
