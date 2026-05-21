import clsx from "clsx";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./BottomNav.module.css";

const getTabValue = (pathname) => {
  if (pathname.startsWith("/explore")) {
    return 1;
  }
  if (pathname.startsWith("/write")) {
    return 2;
  }
  if (pathname.startsWith("/my-schedule")) {
    return 3;
  }
  if (pathname.startsWith("/wishlist")) {
    return 4;
  }
  return 0;
};

const NAV_ITEMS = [
  {
    label: "홈",
    activeIcon: HomeRoundedIcon,
    inactiveIcon: HomeOutlinedIcon,
    route: "/",
  },
  {
    label: "탐색",
    activeIcon: ManageSearchIcon,
    inactiveIcon:  SearchRoundedIcon,
    route: "/explore",
  },
  {
    label: "",
    activeIcon: AddRoundedIcon,
    inactiveIcon: AddRoundedIcon,
    route: "/write",
    isAdd: true,
  },
  {
    label: "내 일정",
    activeIcon: CalendarMonthRoundedIcon,
    inactiveIcon: CalendarMonthOutlinedIcon,
    route: "/my-schedule",
  },
  {
    label: "위시리스트",
    activeIcon: FavoriteRoundedIcon,
    inactiveIcon: FavoriteBorderRoundedIcon,
    route: "/wishlist",
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const value = getTabValue(location.pathname);

  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/");
        break;
      case 1:
        navigate("/explore");
        break;
      case 2:
        navigate("/write");
        break;
      case 3:
        navigate("/my-schedule");
        break;
      case 4:
        navigate("/wishlist");
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.wrapper}>
      <BottomNavigation
        className={styles.innerNav}
        value={value}
        onChange={handleChange}
        showLabels
      >
        {NAV_ITEMS.map((item, index) => {
          const isActive = value === index;
          const Icon = isActive ? item.activeIcon : item.inactiveIcon;

          return (
            <BottomNavigationAction
              key={item.route}
              label={item.label}
              className={clsx(
                styles.navAction,
                isActive && styles.navActionActive,
                item.isAdd && styles.navActionAdd,
              )}
              icon={
                item.isAdd ? (
                  <span
                    className={clsx(
                      styles.addButtonShell,
                      isActive && styles.addButtonShellActive,
                    )}
                  >
                    <Icon className={styles.addBtn} />
                  </span>
                ) : (
                  <Icon className={styles.navIcon} />
                )
              }
            />
          );
        })}
      </BottomNavigation>
    </div>
  );
}
