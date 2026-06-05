import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useMypage } from "../../features/user/mypage/useMypage";
import { useAuthStore } from "../../features/auth/store/authStore";
import LayoutContainer from "../../shared/ui/LayoutContainer/LayoutContainer";
import NotificationPopover from "../../features/notification/ui/NotificationPopover";
import Badge from "@mui/material/Badge";
import { getNotificationCount } from "../../features/notification/api";

const DEFAULT_PROFILE_IMAGE = "/default-profile-240.png";

export default function Header() {
  const navigate = useNavigate();

  const { user: loginUser, isLoggedIn } = useAuthStore();
  const { mypageQuery } = useMypage(isLoggedIn);

  const { data: notificationCount = 0 } = useQuery({
    queryKey: ["notification-count", loginUser?.email],
    queryFn: () => getNotificationCount(loginUser.email),
    enabled: !!(isLoggedIn && loginUser?.email),
    refetchOnWindowFocus: true, // 사용자가 앱/탭에 다시 들어왔을 때만 최신화되도록
  });

  const headerProfileImage =
    mypageQuery.data?.profileImage ||
    loginUser?.profileImage ||
    DEFAULT_PROFILE_IMAGE;

  const avatarFallback = (
    loginUser?.nickname?.trim()?.charAt(0) ||
    loginUser?.email?.trim()?.charAt(0) ||
    ""
  ).toUpperCase();

  const handleProfileClick = () => {
    if (isLoggedIn && loginUser?.email) {
      navigate(`/mypage/${loginUser.email}`);
      return;
    }

    navigate("/login");
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  console.log("헤더 mypageQuery.data:", mypageQuery?.data);
  console.log(
    "헤더 mypageQuery profileImage:",
    mypageQuery?.data?.profileImage,
  );
  console.log("헤더 loginUser:", loginUser);
  console.log("헤더 loginUser.profileImage:", loginUser?.profileImage);
  console.log("헤더 최종 이미지:", headerProfileImage);

  return (
    <header className={styles.header}>
      <LayoutContainer className={styles.contentShell}>
        <div className={styles.leftGroup}>
          <button
            type="button"
            className={styles.logoButton}
            onClick={() => navigate("/")}
            aria-label="WithDay 홈으로 이동"
          >
            <img
              src="/withday_logo.png"
              alt="WithDay"
              className={styles.logoImage}
            />
          </button>
        </div>

        <div className={styles.rightGroup}>
          {isLoggedIn && (
            <>
              <IconButton
                className={styles.actionButton}
                aria-label="알림"
                onClick={handleNotificationClick}
              >
                <Badge
                  color="error"
                  variant="dot"
                  invisible={notificationCount === 0}
                >
                  <NotificationsNoneRoundedIcon />
                </Badge>
              </IconButton>

              <NotificationPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                handleClose={handleClose}
              />
            </>
          )}

          <IconButton
            className={styles.actionButton}
            aria-label="마이페이지"
            onClick={handleProfileClick}
          >
            <Avatar src={headerProfileImage} className={styles.profileAvatar}>
              {avatarFallback || <PersonOutlineRoundedIcon fontSize="small" />}
            </Avatar>
          </IconButton>
        </div>
      </LayoutContainer>
    </header>
  );
}
