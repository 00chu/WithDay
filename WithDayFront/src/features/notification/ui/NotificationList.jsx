import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  readNotification,
  deleteNotification,
  deleteReadNotifications,
  deleteAllNotifications,
} from "../api";
import styles from "./Notification.module.css";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useAuthStore } from "../../auth/store/authStore";

export default function NotificationList({ onClose }) {
  const navigate = useNavigate();
  const { user: loginUser } = useAuthStore();

  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    // 쿼리 키를 로그인 유저 별로 분리해서 유저 변경 시
    // 이전 사용자의 데이터를 보지 않고 새로 불러올 수 있도록 함.
    queryKey: ["notifications", loginUser?.email],
    queryFn: getNotifications,
    enabled: !!loginUser?.email,
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

    // 알림 목록 재요청
    await queryClient.invalidateQueries({
      queryKey: ["notifications", loginUser?.email],
    });

    // 알림 개수 재요청
    await queryClient.invalidateQueries({
      queryKey: ["notification-count", loginUser?.email],
    });

    onClose();

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

  // 전체 알림 삭제
  const handleDeleteAll = async () => {
    await deleteAllNotifications();

    // 목록 다시 조회
    await queryClient.invalidateQueries({
      queryKey: ["notifications", loginUser?.email],
    });

    // 빨간 점 갱신
    await queryClient.invalidateQueries({
      queryKey: ["notification-count", loginUser?.email],
    });
  };

  // 읽은 알림 삭제
  const handleDeleteRead = async () => {
    await deleteReadNotifications();

    // 목록 다시 조회
    await queryClient.invalidateQueries({
      queryKey: ["notifications", loginUser?.email],
    });

    // 빨간 점 갱신
    await queryClient.invalidateQueries({
      queryKey: ["notification-count", loginUser?.email],
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <div className={styles.wrapper}>
      {/* 상단 고정 헤더 */}
      <div className={styles.topBar}>
        <button className={styles.topButton} onClick={handleDeleteAll}>
          전체 삭제
        </button>

        <button className={styles.topButton} onClick={handleDeleteRead}>
          읽은 알림 삭제
        </button>
      </div>

      <div className={styles.listScroll}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleClickNotification(notification)}
            className={
              notification.isRead
                ? styles.readNotification
                : styles.notification
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
                onClick={(e) => handleDeleteNotification(e, notification.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
