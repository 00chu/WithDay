import { useAuthStore } from "../auth/store/authStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  // 로그인 안 된 경우 - 알림, 리다이렉트 대기
  if (!isLoggedIn) {
    return (
      <Snackbar
        open={true}
        autoHideDuration={1500}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: {
            xs: "100px", // 모바일
            sm: "80px", // 태블릿
            md: "100px", // PC
          },
        }}
      >
        <Alert severity="warning" variant="filled">
          로그인이 필요한 기능입니다
        </Alert>
      </Snackbar>
    );
  }

  // 로그인 인증 완료 시
  return children;
};

export default PrivateRoute;
