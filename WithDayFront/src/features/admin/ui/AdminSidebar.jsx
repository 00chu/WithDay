import { NavLink } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import styles from "./AdminSidebar.module.css";

const AdminSidebar = ({ closeDrawer = () => {} }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>WithDay</span>
        <span className={styles.admin}>Admin</span>
      </div>

      <nav className={styles.menu}>
        <NavLink
          to="/admin"
          end
          onClick={closeDrawer}
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
        >
          <DashboardOutlinedIcon />
          <span>대시보드</span>
        </NavLink>

        <NavLink
          to="/admin/member"
          onClick={closeDrawer}
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
        >
          <GroupOutlinedIcon />
          <span>회원 관리</span>
        </NavLink>

        <NavLink
          to="/admin/report"
          onClick={closeDrawer}
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
        >
          <AssignmentOutlinedIcon />
          <span>문의 관리</span>
        </NavLink>

        <NavLink
          to="/admin/blacklist"
          onClick={closeDrawer}
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
        >
          <ReportProblemOutlinedIcon />
          <span>신고 회원 관리</span>
        </NavLink>

        <NavLink
          to="/admin/setting"
          onClick={closeDrawer}
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
        >
          <SettingsOutlinedIcon />
          <span>설정</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
