import { useAuthStore } from "../auth/store/authStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// 로그인 안 하고 로그인 필요한 기능 사용하려고 할 시 로그인 창으로 이동
const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const navigate = useNavigate();

  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setAlertOpen(true);

      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return (
      <Snackbar
        open={alertOpen}
        autoHideDuration={1500}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity="warning"
          variant="filled"
        >
          로그인이 필요한 기능입니다
        </Alert>
      </Snackbar>
    );
  }

  return children;
};

export default PrivateRoute;
