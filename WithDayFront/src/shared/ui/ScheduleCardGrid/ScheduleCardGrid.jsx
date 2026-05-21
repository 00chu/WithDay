import clsx from "clsx";
import styles from "./ScheduleCardGrid.module.css";

export default function ScheduleCardGrid({ children, className }) {
  return <div className={clsx(styles.grid, className)}>{children}</div>;
}
