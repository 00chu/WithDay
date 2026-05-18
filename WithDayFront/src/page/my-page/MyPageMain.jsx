import { useParams } from "react-router-dom";
import styles from "./MyPageMain.module.css";
import Login from "../login/Login";
import { getAuthUser } from "../../features/auth/lib/getAuthUser";

const MyPageMain = () => {
  const { userId } = useParams();
  const loginUser = getAuthUser();

  // 로그인 정보나 id 없으면 return
  if (!loginUser || !loginUser.email) {
    return <Login />;
  }
  if (String(loginUser.id) !== String(userId)) {
    return <div className={styles.error}>잘못된 접근입니다.</div>;
  }
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <p>"안녕" {loginUser.name || loginUser.email}님!</p>
      </section>
    </div>
  );
};
export default MyPageMain;
