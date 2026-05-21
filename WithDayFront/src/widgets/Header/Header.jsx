import { useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { getRegion } from "../../features/region/api";
import { getAuthUser } from "../../features/auth/lib/getAuthUser";
import LayoutContainer from "../../shared/ui/LayoutContainer/LayoutContainer";
import RegionSelect from "../../shared/ui/RegionSelect/RegionSelect";
import NotificationPopover from "../../features/notification/ui/NotificationPopover";

const DEFAULT_REGION_OPTION = { label: "전체", value: "" };

const normalizeRegionValue = (value) => value?.trim() ?? "";

export default function Header({ selectedRegion, onRegionChange }) {
  const navigate = useNavigate();
  const loginUser = getAuthUser();
  const { data: regions = [] } = useQuery({
    queryKey: ["header-region-options"],
    queryFn: getRegion,
    staleTime: 1000 * 60 * 10,
  });

  const regionOptions = useMemo(() => {
    return [
      DEFAULT_REGION_OPTION,
      ...regions.map((region) => ({
        label: region.regionName,
        value: normalizeRegionValue(region.regionName),
      })),
    ];
  }, [regions]);

  const selectedRegionValue = normalizeRegionValue(selectedRegion);
  const avatarFallback = (
    loginUser?.nickname?.trim()?.charAt(0) ||
    loginUser?.email?.trim()?.charAt(0) ||
    ""
  ).toUpperCase();

  const handleProfileClick = () => {
    if (loginUser?.email) {
      navigate(`/mypage/${loginUser.email}`);
      return;
    }

    navigate("/login");
  };

  const [anchorEl, setAnchorEl] = useState(null);

  // 알림 버튼 클릭
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 팝오버 닫기
  const handleClose = () => {
    setAnchorEl(null);
  };

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

        <div className={styles.centerGroup}>
          <RegionSelect
            value={selectedRegionValue}
            options={regionOptions}
            onSelect={(option) =>
              onRegionChange?.(normalizeRegionValue(option.value))
            }
            theme="navy"
            className={styles.regionSelect}
          />
        </div>

        <div className={styles.rightGroup}>
          <IconButton
            className={styles.actionButton}
            aria-label="알림"
            onClick={handleNotificationClick}
          >
            <NotificationsNoneRoundedIcon />
          </IconButton>
          <NotificationPopover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            handleClose={handleClose}
          />
          <IconButton
            className={styles.actionButton}
            aria-label="마이페이지"
            onClick={handleProfileClick}
          >
            <Avatar className={styles.profileAvatar}>
              {avatarFallback || <PersonOutlineRoundedIcon fontSize="small" />}
            </Avatar>
          </IconButton>
        </div>
      </LayoutContainer>
    </header>
  );
}
