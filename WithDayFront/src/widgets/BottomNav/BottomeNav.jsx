import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
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
        <BottomNavigationAction label="홈" icon={<HomeRoundedIcon />} />
        <BottomNavigationAction label="탐색" icon={<SearchRoundedIcon />} />
        <BottomNavigationAction
          label=""
          icon={
            <span className={styles.addButtonShell}>
              <AddRoundedIcon className={styles.addBtn} />
            </span>
          }
        />
        <BottomNavigationAction
          label="내 일정"
          icon={<CalendarMonthRoundedIcon />}
        />
        <BottomNavigationAction
          label="위시리스트"
          icon={<FavoriteBorderRoundedIcon />}
        />
      </BottomNavigation>
    </div>
  );
}
