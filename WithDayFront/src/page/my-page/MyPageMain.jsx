// MyPageMain.jsx
import { getAuthUser } from "../../features/auth/lib/getAuthUser";
import Login from "../login/Login";

const MyPageMain = () => {
  // 팀장님이 말한 튕기기 기능(useRequireAuth) 대신, 순수하게 유저 정보만 쏙 꺼내오기!
  const loginUser = getAuthUser();

  // 로그인 안 되어 있으면 주소창 유지한 채 로그인 컴포넌트 띄우기
  if (!loginUser || !loginUser.email) {
    return <Login />;
  }

  // 로그인 되어 있으면 마이페이지 보여주기
  return <div>마이페이지 본문</div>;
};
